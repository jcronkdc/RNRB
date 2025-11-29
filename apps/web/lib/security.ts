/**
 * SECURITY UTILITIES
 *
 * Centralized security functions for input validation,
 * sanitization, and protection against common attacks.
 */

// ============================================
// INPUT VALIDATION
// ============================================

/**
 * Validate and sanitize a string ID (CUID format)
 * Prevents SQL injection by only allowing alphanumeric + underscore
 */
export function validateId(id: string | null | undefined): string | null {
  if (!id) return null;
  // CUID format: c + lowercase alphanumeric (25 chars total)
  const cuidPattern = /^c[a-z0-9]{24}$/;
  // Also allow UUID format
  const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

  if (cuidPattern.test(id) || uuidPattern.test(id)) {
    return id;
  }

  console.warn(`[SECURITY] Invalid ID format rejected: ${id.substring(0, 50)}`);
  return null;
}

/**
 * Validate pagination cursor
 */
export function validateCursor(cursor: string | null | undefined): string | null {
  return validateId(cursor);
}

/**
 * Validate and clamp a numeric limit parameter
 */
export function validateLimit(
  limit: string | null | undefined,
  max: number = 100,
  defaultValue: number = 20
): number {
  if (!limit) return defaultValue;

  const parsed = parseInt(limit, 10);
  if (isNaN(parsed) || parsed < 1) return defaultValue;

  return Math.min(parsed, max);
}

/**
 * Validate offset for pagination
 */
export function validateOffset(offset: string | null | undefined, max: number = 10000): number {
  if (!offset) return 0;

  const parsed = parseInt(offset, 10);
  if (isNaN(parsed) || parsed < 0) return 0;

  return Math.min(parsed, max);
}

/**
 * Sanitize search query - prevents SQL injection and XSS
 */
export function sanitizeSearchQuery(
  query: string | null | undefined,
  maxLength: number = 200
): string {
  if (!query) return '';

  // Remove potentially dangerous characters
  const sanitized = query
    .trim()
    .slice(0, maxLength)
    // Remove SQL injection patterns
    .replace(/[';"\-\-\/\*\\\x00-\x1f]/g, '')
    // Remove HTML/XSS patterns
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');

  return sanitized;
}

/**
 * Validate email format
 */
export function validateEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailPattern.test(email) && email.length <= 254) {
    return email.toLowerCase();
  }

  return null;
}

/**
 * Sanitize user-provided content (for posts, comments, etc.)
 */
export function sanitizeContent(
  content: string | null | undefined,
  maxLength: number = 10000
): string {
  if (!content) return '';

  return (
    content
      .trim()
      .slice(0, maxLength)
      // Remove null bytes and control characters
      .replace(/\x00/g, '')
      // Allow most content but escape HTML
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  );
}

/**
 * Validate URL format (for links, images, etc.)
 */
export function validateUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.warn(`[SECURITY] Invalid URL protocol rejected: ${parsed.protocol}`);
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Validate visibility setting
 */
export function validateVisibility(
  visibility: string | null | undefined
): 'public' | 'friends' | 'private' {
  const valid = ['public', 'friends', 'private'];
  if (visibility && valid.includes(visibility)) {
    return visibility as 'public' | 'friends' | 'private';
  }
  return 'public';
}

/**
 * Validate content type
 */
export function validateContentType(
  type: string | null | undefined
): 'text' | 'audio' | 'image' | 'video' | 'link' {
  const valid = ['text', 'audio', 'image', 'video', 'link'];
  if (type && valid.includes(type)) {
    return type as 'text' | 'audio' | 'image' | 'video' | 'link';
  }
  return 'text';
}

// ============================================
// RATE LIMITING
// ============================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
export function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Rate limit by user ID
 */
export function rateLimitUser(userId: string, action: string, limit: number = 100): boolean {
  const key = `user:${userId}:${action}`;
  return checkRateLimit(key, limit).allowed;
}

/**
 * Rate limit by IP address
 */
export function rateLimitIp(ip: string, action: string, limit: number = 50): boolean {
  const key = `ip:${ip}:${action}`;
  return checkRateLimit(key, limit).allowed;
}

// ============================================
// CSRF & REQUEST VALIDATION
// ============================================

/**
 * Validate request origin (for CSRF protection)
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // In development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    'https://cronkwaters.com',
    'https://www.cronkwaters.com',
  ].filter(Boolean);

  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed!))) {
    return true;
  }

  if (referer && allowedOrigins.some((allowed) => referer.startsWith(allowed!))) {
    return true;
  }

  console.warn(`[SECURITY] Origin validation failed: ${origin || referer}`);
  return false;
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

// ============================================
// SECURITY LOGGING
// ============================================

export function logSecurityEvent(
  event: 'auth_failure' | 'rate_limit' | 'invalid_input' | 'suspicious_activity',
  details: Record<string, any>
): void {
  console.log(`[SECURITY EVENT] ${event}`, {
    timestamp: new Date().toISOString(),
    ...details,
  });

  // In production, send to security monitoring service
  // e.g., Sentry, DataDog, etc.
}

// ============================================
// SQL INJECTION PREVENTION
// ============================================

/**
 * Escape string for safe use in raw SQL (use sparingly!)
 * Prefer Prisma's parameterized queries instead
 */
export function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Validate an array of IDs for use in SQL IN clause
 */
export function validateIdArray(ids: string[]): string[] {
  return ids.filter((id) => validateId(id) !== null);
}
