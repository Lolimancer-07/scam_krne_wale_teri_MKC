import { db } from './db';
import { logger } from './logger';

/**
 * 30-Day Sample Retention Purge
 * Permanently deletes any opted-in raw text samples older than 30 days.
 */
export async function purgeExpiredRawSamples(): Promise<{ purgedCount: number }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    const result = await db.analysis.updateMany({
      where: {
        rawStoredAt: {
          lt: thirtyDaysAgo,
        },
        rawText: {
          not: null,
        },
      },
      data: {
        rawText: null,
        rawStoredAt: null,
      },
    });

    logger.info(
      { purgedCount: result.count, cutoffDate: thirtyDaysAgo },
      'Purged expired raw samples',
    );
    return { purgedCount: result.count };
  } catch (err) {
    logger.warn({ err: (err as Error).message }, 'Failed to run retention purge (degraded mode)');
    return { purgedCount: 0 };
  }
}
