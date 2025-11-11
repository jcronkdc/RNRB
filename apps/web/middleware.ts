import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Block if DEMO_BYPASS is enabled outside of development
const SHOULD_BLOCK = process.env.DEMO_BYPASS === '1' && process.env.NODE_ENV !== 'development';
const SAFE_PATHS = [/^\/(_next|favicon\.|icon\.|blocked|robots\.txt|sitemap\.xml|opengraph-image|.*\.(svg|jpg|png))($|\/)/];

export function middleware(req: NextRequest) {
  // DEMO_BYPASS safety guard
  if (
    SHOULD_BLOCK &&
    !SAFE_PATHS.some((r) => r.test(req.nextUrl.pathname))
  ) {
    return NextResponse.redirect(new URL('/blocked', req.url));
  }

  // Security headers
  const response = NextResponse.next();

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 'unsafe-eval' needed for Next.js
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon\.|icon\.|robots\.txt|sitemap\.xml|opengraph-image|.*\.(svg|jpg|png)).*)'],
};
