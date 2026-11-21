import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimiter';
import { redactPii } from '@/lib/hash';
import { logger } from '@/lib/logger';
import { generateRequestId, ok, err } from '@/lib/requestId';

const FeedbackSchema = z.object({
  analysisId: z.string().optional(),
  isCorrect: z.boolean(),
  verdict: z.string().optional(),
  score: z.number().optional(),
  category: z.string().optional(),
  comment: z.string().max(500).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rl = await rateLimit(`feedback:${clientIp}`, 20, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      err(requestId, 'RATE_LIMITED', 'Too many feedback submissions. Please try again later.'),
      { status: 429, headers: { 'X-Request-Id': requestId, 'Retry-After': '60' } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(requestId, 'INVALID_JSON', 'Request body must be valid JSON'), {
      status: 400,
      headers: { 'X-Request-Id': requestId },
    });
  }

  const parseResult = FeedbackSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      err(requestId, 'VALIDATION_ERROR', 'Invalid feedback payload', parseResult.error.flatten()),
      { status: 400, headers: { 'X-Request-Id': requestId } },
    );
  }

  const { analysisId, isCorrect, comment } = parseResult.data;
  const redactedComment = comment ? redactPii(comment).trim() : null;

  try {
    // If an analysisId is provided and exists in DB, connect relation
    if (analysisId) {
      await db.feedback.create({
        data: {
          analysisId,
          isCorrect,
          comment: redactedComment ?? undefined,
        },
      });
    }

    logger.info({ requestId, isCorrect, analysisId }, 'Feedback recorded successfully');

    return NextResponse.json(
      ok(requestId, { saved: true, message: 'Thank you for helping improve ScamShield accuracy' }),
      { status: 201, headers: { 'X-Request-Id': requestId } },
    );
  } catch (error) {
    logger.warn(
      { requestId, err: (error as Error).message },
      'Feedback DB write failed (degraded mode)',
    );
    return NextResponse.json(ok(requestId, { saved: false, message: 'Feedback noted' }), {
      status: 200,
      headers: { 'X-Request-Id': requestId },
    });
  }
}
