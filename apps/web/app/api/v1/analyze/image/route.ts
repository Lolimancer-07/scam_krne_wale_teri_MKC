import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { analyzeText } from '@scamshield/detector';
import { rateLimit } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';
import { generateRequestId, ok, err } from '@/lib/requestId';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/pjpeg',
  'image/x-png',
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  // Strict rate limit for OCR (10 req/min per IP to prevent compute exhaustion)
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rl = await rateLimit(`analyze-image:${clientIp}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      err(
        requestId,
        'RATE_LIMITED',
        'OCR rate limit exceeded. Please wait 1 minute before uploading another image.',
      ),
      { status: 429, headers: { 'X-Request-Id': requestId } },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      err(
        requestId,
        'INVALID_FILE',
        'An image file must be uploaded under the "image" field as multipart/form-data',
      ),
      { status: 400, headers: { 'X-Request-Id': requestId } },
    );
  }

  try {
    const file = formData.get('image');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        err(requestId, 'INVALID_FILE', 'An image file must be uploaded under the "image" field'),
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    const fileName = (file as any).name || '';
    const hasValidExt = /\.(png|jpe?g|webp)$/i.test(fileName);
    const hasValidMime = ALLOWED_MIME_TYPES.has(file.type);

    if (!hasValidMime && !hasValidExt) {
      return NextResponse.json(
        err(requestId, 'UNSUPPORTED_TYPE', 'Only PNG, JPEG, and WebP images are supported'),
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        err(requestId, 'FILE_TOO_LARGE', 'Image size exceeds the 5MB maximum limit'),
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Locate local traineddata if present to speed up OCR and work offline
    const possiblePaths = [
      path.join(process.cwd(), 'apps/web'),
      process.cwd(),
      path.resolve(__dirname, '../../../../..'),
    ];
    let localLangPath: string | undefined;
    for (const p of possiblePaths) {
      if (fs.existsSync(path.join(p, 'eng.traineddata'))) {
        localLangPath = p;
        break;
      }
    }

    const workerOptions: Record<string, any> = {
      errorHandler: (e: any) => logger.warn({ err: e }, 'Tesseract worker warning'),
    };
    if (localLangPath) {
      workerOptions.langPath = localLangPath;
      workerOptions.gzip = false;
    }

    // Initialize Tesseract worker for English + Hindi OCR with timeout guard
    let extractedText = '';
    const worker = await createWorker(['eng', 'hin'], 1, workerOptions);

    try {
      const recognizePromise = worker.recognize(buffer);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OCR_TIMEOUT')), 15000),
      );

      const result = await Promise.race([recognizePromise, timeoutPromise]);
      extractedText = (result?.data?.text || '')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    } catch (ocrErr) {
      if ((ocrErr as Error)?.message === 'OCR_TIMEOUT') {
        logger.warn({ requestId }, 'OCR timed out after 15 seconds');
        return NextResponse.json(
          err(
            requestId,
            'OCR_TIMEOUT',
            'Image OCR processing timed out. Please crop the screenshot closer to the message, or paste the text directly into the "Paste Message" tab.',
          ),
          { status: 422, headers: { 'X-Request-Id': requestId } },
        );
      }
      throw ocrErr;
    } finally {
      try {
        await worker.terminate();
      } catch {
        // cleanup suppression
      }
    }

    if (!extractedText || !/[a-zA-Z0-9\u0900-\u097F]/.test(extractedText)) {
      return NextResponse.json(
        err(
          requestId,
          'NO_TEXT_FOUND',
          'Could not detect readable text in the uploaded screenshot. Try uploading a clearer, higher-contrast image or crop closer to the text.',
        ),
        { status: 422, headers: { 'X-Request-Id': requestId } },
      );
    }

    // Run extracted text through detection engine
    const detectionResult = await analyzeText({ text: extractedText });

    logger.info(
      { requestId, extractedLength: extractedText.length, verdict: detectionResult.verdict },
      'Screenshot OCR analysis completed',
    );

    return NextResponse.json(
      ok(requestId, {
        extractedText,
        ...detectionResult,
      }),
      { status: 200, headers: { 'X-Request-Id': requestId } },
    );
  } catch (error) {
    logger.error({ requestId, err: error }, 'Image OCR analysis failed');
    return NextResponse.json(
      err(requestId, 'OCR_PROCESSING_FAILED', 'Failed to process screenshot OCR'),
      { status: 500, headers: { 'X-Request-Id': requestId } },
    );
  }
}
