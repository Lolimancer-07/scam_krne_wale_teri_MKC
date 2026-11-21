import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeText } from '@scamshield/detector';
import { rateLimit } from '@/lib/rateLimiter';
import { hashMessage, redactPii } from '@/lib/hash';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { generateRequestId, ok, err } from '@/lib/requestId';

const AnalyzeTextSchema = z.object({
  text: z
    .string({ required_error: 'Text is required' })
    .trim()
    .min(1, 'Message text cannot be empty')
    .max(5000, 'Message text exceeds the 5,000 character limit'),
  enableAi: z.boolean().optional().default(false),
  storeRaw: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  // Rate Limiting: 30 requests per minute per IP
  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rl = await rateLimit(`analyze-text:${clientIp}`, 30, 60);
  if (!rl.allowed) {
    logger.warn({ requestId, clientIp }, 'Rate limit exceeded for analyze/text');
    return NextResponse.json(
      err(
        requestId,
        'RATE_LIMITED',
        'Rate limit exceeded. Please wait before submitting more messages.',
      ),
      {
        status: 429,
        headers: {
          'X-Request-Id': requestId,
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(err(requestId, 'INVALID_JSON', 'Request body must be valid JSON'), {
      status: 400,
      headers: { 'X-Request-Id': requestId },
    });
  }

  const parseResult = AnalyzeTextSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.flatten();
    return NextResponse.json(
      err(requestId, 'VALIDATION_ERROR', 'Invalid request parameters', errorDetails),
      {
        status: 400,
        headers: { 'X-Request-Id': requestId },
      },
    );
  }

  const { text, enableAi, storeRaw } = parseResult.data;

  try {
    const detectionResult = await analyzeText({
      text,
      enableAi: enableAi && process.env.ENABLE_AI_EXPLANATION === 'true',
    });

    const msgHash = hashMessage(text);

    // Save record to database if accessible (non-blocking fallback)
    try {
      await db.analysis.create({
        data: {
          messageHash: msgHash,
          verdict: detectionResult.verdict,
          score: detectionResult.score,
          category: detectionResult.category,
          redFlagCount: detectionResult.redFlags.length,
          hasUrl: Boolean(detectionResult.urlAnalysis),
          rawText: storeRaw ? redactPii(text) : null,
          rawStoredAt: storeRaw ? new Date() : null,
        },
      });
    } catch (dbErr) {
      // Graceful degradation when running offline/local without Postgres
      logger.warn({ requestId, err: (dbErr as Error).message }, 'DB write failed (degraded mode)');
    }

    logger.info(
      {
        requestId,
        verdict: detectionResult.verdict,
        score: detectionResult.score,
        category: detectionResult.category,
      },
      'Text analysis completed successfully',
    );

    return NextResponse.json(ok(requestId, detectionResult), {
      status: 200,
      headers: {
        'X-Request-Id': requestId,
        'X-RateLimit-Remaining': String(rl.remaining),
      },
    });
  } catch (error) {
    logger.error({ requestId, err: error }, 'Internal error during message analysis');
    return NextResponse.json(
      err(requestId, 'ANALYSIS_ERROR', 'An unexpected error occurred during detection'),
      {
        status: 500,
        headers: { 'X-Request-Id': requestId },
      },
    );
  }
}
