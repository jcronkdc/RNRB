import type { NextRequest } from 'next/server';

import { updateSession } from './lib/supabase/middleware';

export async function middleware(req: NextRequest) {
  // Update Supabase session
  const supabaseResponse = await updateSession(req);

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

  supabaseResponse.headers.set('X-DNS-Prefetch-Control', 'on');
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  supabaseResponse.headers.set('Content-Security-Policy', csp);

  return supabaseResponse;
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
