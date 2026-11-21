import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRequestId, ok } from '@/lib/requestId';

// Aggregate counters must be read per request, never baked in at build time.
export const dynamic = 'force-dynamic';

export async function GET() {
  const requestId = generateRequestId();

  try {
    const [totalScans, byVerdictRaw, byCategoryRaw, recentCount] = await Promise.all([
      db.analysis.count(),
      db.analysis.groupBy({
        by: ['verdict'],
        _count: true,
      }),
      db.analysis.groupBy({
        by: ['category'],
        _count: true,
      }),
      db.analysis.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const byVerdict: Record<string, number> = {
      likely_scam: 0,
      suspicious: 0,
      safe: 0,
    };
    for (const item of byVerdictRaw) {
      byVerdict[item.verdict] = item._count;
    }

    const byCategory: Record<string, number> = {};
    for (const item of byCategoryRaw) {
      byCategory[item.category] = item._count;
    }

    return NextResponse.json(
      ok(requestId, {
        totalScans,
        last24Hours: recentCount,
        byVerdict,
        byCategory,
      }),
      { status: 200, headers: { 'X-Request-Id': requestId } },
    );
  } catch {
    // Never present invented numbers as live community statistics. The UI
    // shows an explicit degraded-state notice when this flag is set.
    return NextResponse.json(
      ok(requestId, {
        totalScans: 0,
        last24Hours: 0,
        byVerdict: {
          likely_scam: 0,
          suspicious: 0,
          safe: 0,
        },
        byCategory: {},
        degraded: true,
      }),
      { status: 200, headers: { 'X-Request-Id': requestId } },
    );
  }
}
