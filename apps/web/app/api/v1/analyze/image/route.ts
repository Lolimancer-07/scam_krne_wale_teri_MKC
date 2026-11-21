import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import { analyzeText } from '@scamshield/detector';
import { rateLimit } from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';
import { generateRequestId, ok, err } from '@/lib/requestId';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

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

  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        err(requestId, 'INVALID_FILE', 'An image file must be uploaded under the "image" field'),
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
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

    // Initialize Tesseract worker for English + Hindi OCR
    let extractedText = '';
    const worker = await createWorker(['eng', 'hin'], undefined, {
      errorHandler: (e) => logger.warn({ err: e }, 'Tesseract worker warning'),
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(buffer);
      extractedText = (text || '').trim();
    } finally {
      await worker.terminate();
    }

    if (!extractedText) {
      return NextResponse.json(
        err(
          requestId,
          'NO_TEXT_FOUND',
          'Could not extract readable text from the uploaded screenshot. Try cropping closer to the message.',
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
