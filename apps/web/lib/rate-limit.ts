/**
 * RATE LIMITING
 *
 * In-memory rate limiting for API routes.
 * For production, consider using Redis or Upstash.
 *
 * Usage:
 *   import { rateLimit, RateLimitConfig } from '@/lib/rate-limit';
 *
 *   // In API route:
 *   const limiter = rateLimit({ interval: 60000, limit: 10 });
 *   const { success } = await limiter.check(userId);
 *   if (!success) throw AppError.rateLimited();
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

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for distributed rate limiting)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
// Server-side only - rate limiting should only run on the server
let cleanupInterval: NodeJS.Timeout | null = null;

if (typeof window === 'undefined') {
  // Server-side only
  cleanupInterval = setInterval(
    () => {
      const now = Date.now();
      const entries = Array.from(rateLimitStore.entries());
      for (let i = 0; i < entries.length; i++) {
        const [key, entry] = entries[i];
        if (entry.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
    },
    5 * 60 * 1000
  );

  // Cleanup on process exit (for serverless environments)
  if (typeof process !== 'undefined') {
    const cleanup = () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
    process.on('exit', cleanup);
  }
}

/**
 * Create a rate limiter
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, limit, prefix = 'rl' } = config;

  return {
    /**
     * Check if request is allowed
     * @param identifier - User ID, IP, or other unique identifier
     * @returns { success, remaining, reset }
     */
    async check(identifier: string): Promise<{
      success: boolean;
      remaining: number;
      reset: number;
    }> {
      const key = `${prefix}:${identifier}`;
      const now = Date.now();

      let entry = rateLimitStore.get(key);

      // Create new entry or reset if expired
      if (!entry || entry.resetTime < now) {
        entry = {
          count: 0,
          resetTime: now + interval,
        };
      }

      // Check if limit exceeded
      if (entry.count >= limit) {
        return {
          success: false,
          remaining: 0,
          reset: entry.resetTime,
        };
      }

      // Increment count
      entry.count++;
      rateLimitStore.set(key, entry);

      return {
        success: true,
        remaining: limit - entry.count,
        reset: entry.resetTime,
      };
    },

    /**
     * Reset rate limit for identifier
     */
    async reset(identifier: string): Promise<void> {
      const key = `${prefix}:${identifier}`;
      rateLimitStore.delete(key);
    },
  };
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
// HELPER FUNCTION
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
