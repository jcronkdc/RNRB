import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, addRateLimitHeaders, RateLimitError } from './lib/rate-limit';
import { getCSRFToken } from './lib/csrf';

export async function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Rate limiting for auth endpoints
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
    try {
      const rateLimitResult = await checkRateLimit('auth');
      if (!rateLimitResult.success) {
        return new NextResponse('Too Many Requests', { 
          status: 429,
          headers: {
            'Retry-After': Math.floor((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        });
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        return new NextResponse('Too Many Requests', { 
          status: 429,
          headers: {
            'Retry-After': error.retryAfter.toString()
          }
        });
      }
    }
  }

  // Generate CSRF token for state-changing requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      await getCSRFToken();
    } catch (error) {
      console.error('CSRF token generation error:', error);
    }
  }

  // Enhanced Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' https://apis.google.com https://accounts.google.com",
    "style-src 'self' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.cronkwaters.com wss://cronkwaters.com https://accounts.google.com",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '0'); // Disabled in modern browsers, CSP is better
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Content-Security-Policy', csp);
  
  // Additional security headers
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next (Next.js internals)
     * - favicon, icon, robots.txt, sitemap.xml (static files)
     * - opengraph-image (Next.js metadata)
     * - files with extensions: svg, jpg, png
     */
    '/((?!_next|favicon|icon|robots\\.txt|sitemap\\.xml|opengraph-image|.*\\.(?:svg|jpg|png)).*)',
  ],
};
