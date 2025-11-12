import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(_req: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

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
