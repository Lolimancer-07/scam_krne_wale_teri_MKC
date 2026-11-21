import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch {
    // If DB is offline, indicate degraded readiness
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'disconnected',
        note: 'Engine working in stateless mode',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}
