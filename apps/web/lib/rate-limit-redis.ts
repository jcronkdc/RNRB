/**
 * DISTRIBUTED RATE LIMITING WITH UPSTASH REDIS
 *
 * For 1000+ concurrent users, in-memory rate limiting fails because
 * each serverless instance has its own memory. This uses Upstash Redis
 * for distributed rate limiting across all instances.
 *
 * Setup:
 * 1. Create free account at https://upstash.com
 * 2. Create a Redis database
 * 3. Add to .env:
 *    UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *    UPSTASH_REDIS_REST_TOKEN=xxx
 *
 * If Redis is not configured, falls back to in-memory limiting.
 */

import { AppError } from '@/lib/errors';

// Check if Upstash is configured
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_REDIS = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

// Fallback in-memory store
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  /** Time window in milliseconds */
  interval: number;
  /** Maximum requests per interval */
  limit: number;
  /** Unique prefix for this limiter */
  prefix?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Redis-based rate limit check using Upstash REST API
 */
async function checkRedis(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Use sliding window with sorted sets
    const pipeline = [
      // Remove old entries outside the window
      ['ZREMRANGEBYSCORE', key, '0', windowStart.toString()],
      // Count current requests in window
      ['ZCARD', key],
      // Add current request
      ['ZADD', key, now.toString(), `${now}-${Math.random()}`],
      // Set expiry on the key
      ['PEXPIRE', key, (windowMs + 1000).toString()],
    ];

    const response = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
      signal: AbortSignal.timeout(3000), // 3s timeout
    });

    if (!response.ok) {
      throw new Error(`Redis error: ${response.status}`);
    }

    const results = await response.json();
    const currentCount = results[1]?.result || 0;

    return {
      success: currentCount < limit,
      remaining: Math.max(0, limit - currentCount - 1),
      reset: now + windowMs,
      limit,
    };
  } catch (error) {
    console.warn('[Rate Limit] Redis error, falling back to memory:', error);
    return checkMemory(key, limit, windowMs);
  }
}

/**
 * In-memory rate limit check (fallback)
 */
function checkMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + windowMs };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
      limit,
    };
  }

  entry.count++;
  memoryStore.set(key, entry);

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime,
    limit,
  };
}

/**
 * Create a distributed rate limiter
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, limit, prefix = 'rl' } = config;

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const key = `${prefix}:${identifier}`;

      if (USE_REDIS) {
        return checkRedis(key, limit, interval);
      }

      return checkMemory(key, limit, interval);
    },

    async reset(identifier: string): Promise<void> {
      const key = `${prefix}:${identifier}`;

      if (USE_REDIS) {
        try {
          await fetch(`${UPSTASH_URL}/DEL/${key}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
            signal: AbortSignal.timeout(3000),
          });
        } catch {
          // Ignore errors on reset
        }
      }

      memoryStore.delete(key);
    },
  };
}

// ============================================
// PRESET RATE LIMITERS (1000 user scale)
// ============================================

/**
 * Standard API rate limiter (200 requests per minute per user)
 * Increased for 1000 concurrent users
 */
export const standardLimiter = rateLimit({
  interval: 60 * 1000,
  limit: 200,
  prefix: 'api',
});

/**
 * Strict rate limiter for write operations (30 requests per minute)
 */
export const strictLimiter = rateLimit({
  interval: 60 * 1000,
  limit: 30,
  prefix: 'strict',
});

/**
 * AI endpoint rate limiter (20 requests per minute)
 * Keep low due to cost
 */
export const aiLimiter = rateLimit({
  interval: 60 * 1000,
  limit: 20,
  prefix: 'ai',
});

/**
 * Upload rate limiter (10 uploads per minute)
 */
export const uploadLimiter = rateLimit({
  interval: 60 * 1000,
  limit: 10,
  prefix: 'upload',
});

/**
 * Auth rate limiter (10 attempts per minute)
 */
export const authLimiter = rateLimit({
  interval: 60 * 1000,
  limit: 10,
  prefix: 'auth',
});

/**
 * Ably token rate limiter (200 requests per minute)
 */
export const ablyTokenLimiter = rateLimit({
  interval: 60 * 1000,
  limit: 200,
  prefix: 'ably-token',
});

// ============================================
// HELPER FUNCTION
// ============================================

export async function checkRateLimit(
  limiter: ReturnType<typeof rateLimit>,
  identifier: string
): Promise<void> {
  const result = await limiter.check(identifier);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    throw AppError.rateLimited(retryAfter);
  }
}

// Log Redis status on startup
if (typeof window === 'undefined') {
  if (USE_REDIS) {
    console.log('[Rate Limit] ✅ Using Upstash Redis for distributed rate limiting');
  } else {
    console.warn(
      '[Rate Limit] ⚠️ Using in-memory rate limiting (add UPSTASH_REDIS_* env vars for scale)'
    );
  }
}
