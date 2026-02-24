/**
 * RATE LIMITING
 *
 * Distributed rate limiting via Upstash Redis when configured.
 * Falls back to in-memory limiting (per-instance only) otherwise.
 *
 * Setup for production:
 *   1. Create a Redis database at https://upstash.com
 *   2. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
 *
 * Usage:
 *   import { rateLimit, checkRateLimit } from '@/lib/rate-limit';
 *   const limiter = rateLimit({ interval: 60000, limit: 10 });
 *   await checkRateLimit(limiter, userId);
 */

import { AppError } from '@/lib/errors';

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
}

// ============================================
// UPSTASH REDIS BACKEND
// ============================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_REDIS = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

async function checkRedis(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const pipeline = [
      ['ZREMRANGEBYSCORE', key, '0', windowStart.toString()],
      ['ZCARD', key],
      ['ZADD', key, now.toString(), `${now}-${Math.random()}`],
      ['PEXPIRE', key, (windowMs + 1000).toString()],
    ];

    const response = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipeline),
      signal: AbortSignal.timeout(3000),
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
    };
  } catch (error) {
    console.warn('[Rate Limit] Redis error, falling back to memory:', error);
    return checkMemory(key, limit, windowMs);
  }
}

// ============================================
// IN-MEMORY FALLBACK
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = { count: 0, resetTime: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.resetTime };
  }

  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}

// ============================================
// PUBLIC API
// ============================================

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
      rateLimitStore.delete(key);
    },
  };
}

// Log backend on startup (server-side only)
if (typeof window === 'undefined') {
  if (USE_REDIS) {
    console.log('[Rate Limit] Using Upstash Redis for distributed rate limiting');
  } else {
    console.warn(
      '[Rate Limit] Using in-memory rate limiting (set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for production)'
    );
  }
}

// ============================================
// PRESET RATE LIMITERS
// ============================================

/**
 * Standard API rate limiter (100 requests per minute)
 */
export const standardLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 100,
  prefix: 'api',
});

/**
 * Strict rate limiter for sensitive operations (10 requests per minute)
 */
export const strictLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 10,
  prefix: 'strict',
});

/**
 * AI endpoint rate limiter (20 requests per minute)
 */
export const aiLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 20,
  prefix: 'ai',
});

/**
 * Upload rate limiter (5 uploads per minute)
 */
export const uploadLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 5,
  prefix: 'upload',
});

/**
 * Auth rate limiter (5 attempts per minute)
 */
export const authLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 5,
  prefix: 'auth',
});

/**
 * Public endpoint rate limiter (30 requests per minute)
 * For unauthenticated public API endpoints like newsletter, support tickets
 */
export const publicLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 30,
  prefix: 'public',
});

/**
 * Ably token rate limiter (120 requests per minute)
 * Higher limit because:
 * - Tokens are valid for 1 hour, so we're not worried about token abuse
 * - Multiple components may initialize on page load
 * - Page navigation can trigger multiple components to request tokens
 * - The shared client should reduce requests, but we allow headroom for edge cases
 */
export const ablyTokenLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  limit: 120,
  prefix: 'ably-token',
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check rate limit and throw if exceeded
 */
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

/**
 * Rate limit middleware helper for Next.js API routes
 * Returns a Response if rate limited, null otherwise
 */
export async function rateLimitRequest(
  limiter: ReturnType<typeof rateLimit>,
  request: Request
): Promise<Response | null> {
  // Extract identifier from request (IP or auth header)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const identifier = forwardedFor?.split(',')[0]?.trim() || 'anonymous';

  const result = await limiter.check(identifier);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  return null;
}

// Convenience wrappers that work with the existing pattern
export async function checkStrictLimit(request: Request): Promise<Response | null> {
  return rateLimitRequest(strictLimiter, request);
}

export async function checkStandardLimit(request: Request): Promise<Response | null> {
  return rateLimitRequest(standardLimiter, request);
}

export async function checkAiLimit(request: Request): Promise<Response | null> {
  return rateLimitRequest(aiLimiter, request);
}

export async function checkUploadLimit(request: Request): Promise<Response | null> {
  return rateLimitRequest(uploadLimiter, request);
}

export async function checkAuthLimit(request: Request): Promise<Response | null> {
  return rateLimitRequest(authLimiter, request);
}

export async function checkPublicLimit(request: Request): Promise<Response | null> {
  return rateLimitRequest(publicLimiter, request);
}
