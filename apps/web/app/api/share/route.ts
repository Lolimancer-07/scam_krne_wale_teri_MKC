import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeText } from '@scamshield/detector';
import { rateLimit } from '@/lib/rateLimiter';
import { generateRequestId, ok, err } from '@/lib/requestId';

/**
 * Web Share Target endpoint (PWA).
 *
 * Android "Share" intent from SMS / WhatsApp / browsers POSTes multipart form
 * data here with the shared payload in the `text` field. We accept and run the
 * full deterministic analysis on it, keeping the privacy posture identical to
 * the normal `/api/v1/analyze/text` flow (no AI, raw storage off by default).
 */
export const dynamic = 'force-dynamic';

const ShareSchema = z.object({
  text: z.string().max(5000),
});

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || generateRequestId();

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rl = await rateLimit(`share:${clientIp}`, 20, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      err(requestId, 'RATE_LIMITED', 'Too many share requests. Please try again later.'),
      { status: 429, headers: { 'X-Request-Id': requestId, 'Retry-After': '60' } },
    );
  }

  try {
    const formData = await req.formData();
    const text = String(formData.get('text') ?? '');

    const parsed = ShareSchema.safeParse({ text });
    if (!parsed.success) {
      return NextResponse.json(
        err(
          requestId,
          'VALIDATION_ERROR',
          'Shared text is missing or exceeds the 5,000 character limit',
        ),
        { status: 400, headers: { 'X-Request-Id': requestId } },
      );
    }

    const detectionResult = await analyzeText({ text: parsed.data.text, enableAi: false });

    return NextResponse.json(ok(requestId, { ...detectionResult }), {
      status: 200,
      headers: { 'X-Request-Id': requestId },
    });
  } catch (error) {
    return NextResponse.json(
      err(requestId, 'ANALYSIS_FAILED', 'Failed to analyze shared content'),
      { status: 500, headers: { 'X-Request-Id': requestId } },
    );
  }
}
