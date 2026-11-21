import { getRedis } from './redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// In-memory fallback map when Redis is not configured
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redis = getRedis();

  if (redis) {
    try {
      const redisKey = `rl:${key}`;
      const current = await redis.incr(redisKey);
      if (current === 1) {
        await redis.expire(redisKey, windowSeconds);
      }
      const ttl = await redis.ttl(redisKey);
      const remaining = Math.max(0, limit - current);
      return {
        allowed: current <= limit,
        remaining,
        resetAt: Date.now() + Math.max(0, ttl) * 1000,
      };
    } catch {
      // Fall through to memory fallback
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowSeconds * 1000,
    };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return {
    allowed: entry.count <= limit,
    remaining,
    resetAt: entry.resetAt,
  };
}
