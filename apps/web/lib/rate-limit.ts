import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

// Initialize Redis client (requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    })
  : null;

// Define rate limiters for different endpoints
export const rateLimiters = {
  // Authentication endpoints - stricter limits
  auth: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    analytics: true,
    prefix: 'ratelimit:auth'
  }) : null,
  
  // API endpoints - moderate limits
  api: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
    analytics: true,
    prefix: 'ratelimit:api'
  }) : null,
  
  // Server actions - moderate limits
  serverAction: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
    analytics: true,
    prefix: 'ratelimit:action'
  }) : null,
  
  // File uploads - strict limits
  upload: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 m'), // 10 uploads per 10 minutes
    analytics: true,
    prefix: 'ratelimit:upload'
  }) : null
};

// Get client identifier (IP address or user ID)
export async function getClientId(): Promise<string> {
  const headersList = headers();
  
  // Try to get IP from various headers
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfConnectingIp = headersList.get('cf-connecting-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to a default identifier
  return 'anonymous';
}

// Check rate limit for a specific limiter
export async function checkRateLimit(
  limiterType: keyof typeof rateLimiters,
  identifier?: string
): Promise<{ success: boolean; limit: number; reset: number; remaining: number }> {
  const limiter = rateLimiters[limiterType];
  
  if (!limiter) {
    // If Redis is not configured, allow all requests but log warning
    console.warn('Rate limiting not configured - Redis connection required');
    return { success: true, limit: 0, reset: 0, remaining: 0 };
  }
  
  const clientId = identifier || await getClientId();
  const { success, limit, reset, remaining } = await limiter.limit(clientId);
  
  return { success, limit, reset, remaining };
}

// Middleware function for rate limiting
export async function rateLimitMiddleware(
  limiterType: keyof typeof rateLimiters,
  identifier?: string
) {
  const result = await checkRateLimit(limiterType, identifier);
  
  if (!result.success) {
    const retryAfter = Math.floor((result.reset - Date.now()) / 1000);
    throw new RateLimitError(
      'Too many requests',
      {
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
        retryAfter
      }
    );
  }
  
  return result;
}

// Custom error class for rate limit errors
export class RateLimitError extends Error {
  public readonly statusCode = 429;
  public readonly limit: number;
  public readonly remaining: number;
  public readonly reset: string;
  public readonly retryAfter: number;
  
  constructor(
    message: string,
    details: {
      limit: number;
      remaining: number;
      reset: string;
      retryAfter: number;
    }
  ) {
    super(message);
    this.name = 'RateLimitError';
    this.limit = details.limit;
    this.remaining = details.remaining;
    this.reset = details.reset;
    this.retryAfter = details.retryAfter;
  }
}

// Helper function to add rate limit headers to response
export function addRateLimitHeaders(
  response: Response,
  rateLimitInfo: {
    limit: number;
    remaining: number;
    reset: number;
  }
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(rateLimitInfo.reset).toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Decorator for server actions with rate limiting
export function withRateLimit(limiterType: keyof typeof rateLimiters) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      await rateLimitMiddleware(limiterType);
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}
