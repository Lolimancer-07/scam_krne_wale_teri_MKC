import { NextResponse } from 'next/server';

// Health responses include a timestamp, so they must not be statically frozen
// at build time.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'scamshield-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
