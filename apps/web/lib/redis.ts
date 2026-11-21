import Redis from 'ioredis';

let redisInstance: Redis | null = null;

export function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!redisInstance) {
    try {
      redisInstance = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        lazyConnect: true,
        enableOfflineQueue: false,
        connectTimeout: 2000,
      });
      redisInstance.on('error', (err) => {
        // Log quietly so app does not crash if Redis is unavailable
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[Redis] Connection warning (running in degraded fallback mode):',
            err.message,
          );
        }
      });
    } catch {
      return null;
    }
  }
  return redisInstance;
}
