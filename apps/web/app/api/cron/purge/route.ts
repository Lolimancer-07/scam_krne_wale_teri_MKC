import { NextResponse } from 'next/server';
import { purgeExpiredRawSamples } from '@/lib/retention';

/**
 * Scheduled job that permanently deletes opted-in raw samples older than 30 days.
 * Protected by the `x-cron-secret` header (configure `CRON_SECRET` in the env).
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get('x-cron-secret');

  if (!secret || !provided || provided !== secret) {
    return NextResponse.json({ status: 'forbidden' }, { status: 403 });
  }

  const result = await purgeExpiredRawSamples();

  return NextResponse.json({
    status: 'ok',
    purgedCount: result.purgedCount,
    timestamp: new Date().toISOString(),
  });
}
