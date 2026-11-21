import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
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

  try {
    // If an analysisId is provided and exists in DB, connect relation
    if (analysisId) {
      await db.feedback.create({
        data: {
          analysisId,
          isCorrect,
          comment,
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
