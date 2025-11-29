import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CRITICAL: Do NOT import auth() in middleware - it uses Node.js modules not available in Edge Runtime
// Instead, we check for the session cookie directly

// Known CronkWaters domains (not custom domains)
const KNOWN_DOMAINS = [
  'cronkwaters.com',
  'www.cronkwaters.com',
  'cronkwater.vercel.app',
  'localhost:3001',
  'localhost:3000',
];

// The canonical CronkWaters origin for internal API calls
// Custom domains must route API lookups to the main CronkWaters origin
const CRONKWATERS_ORIGIN =
  process.env.NODE_ENV === 'production' ? 'https://www.cronkwaters.com' : 'http://localhost:3000';

// Routes that require authentication
const protectedPaths = [
  '/dashboard',
  '/projects',
  '/library',
  '/collaboration',
  '/messages',
  '/analytics',
  '/settings',
  '/shows',
  '/venues',
  '/setlists',
  '/songwriting',
  '/perform',
  '/tours',
  '/invite',
  '/invites',
  '/request',
  '/u',
  '/discover',
  '/feed', // Social feed requires auth
  '/auth-test',
  '/posthog-test',
];

// Routes that should redirect to dashboard if already authenticated
const authPaths = ['/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ============================================
  // CUSTOM DOMAIN ROUTING
  // ============================================
  // Check if this is a custom domain (not a known CronkWaters domain)
  const isKnownDomain = KNOWN_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );

  if (!isKnownDomain && hostname && !hostname.includes('vercel')) {
    // This is a custom domain - route to the site lookup API
    // CRITICAL: Use CronkWaters origin, not the custom domain origin
    // The API only exists on CronkWaters, not on custom domains
    try {
      const lookupUrl = new URL('/api/sites/domain/lookup', CRONKWATERS_ORIGIN);
      lookupUrl.searchParams.set('domain', hostname);

      const response = await fetch(lookupUrl.toString(), {
        headers: { 'x-middleware-request': 'true' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.subdomain) {
          // Rewrite to the site page
          const url = request.nextUrl.clone();
          url.pathname = `/s/${data.subdomain}${pathname === '/' ? '' : pathname}`;
          return NextResponse.rewrite(url);
        }
      }
    } catch (error) {
      console.error('[MIDDLEWARE] Custom domain lookup failed:', error);
    }

    // If lookup fails, continue to 404 or show error
  }

  // ============================================
  // STANDARD AUTH ROUTING
  // ============================================
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Check if the current path is an auth page
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Skip middleware for non-protected, non-auth paths (like homepage)
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie (works in Edge Runtime)
  const sessionCookie = request.cookies.get(
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'
  );

  const hasSession = !!sessionCookie;

  // Redirect to /auth if accessing protected path without session
  if (isProtectedPath && !hasSession) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to /dashboard if accessing auth page with valid session
  if (isAuthPath && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ai|psd|json)$).*)',
  ],
};
