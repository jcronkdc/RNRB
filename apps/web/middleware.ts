import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// CRITICAL: Do NOT import auth() in middleware - it uses Node.js modules not available in Edge Runtime
// Instead, we check for the session cookie directly

// Known CronkWaters/RNRB domains (not artist custom domains)
const KNOWN_DOMAINS = [
  // Original domain - KEEP WORKING
  'cronkwaters.com',
  'www.cronkwaters.com',
  'cronkwater.vercel.app',
  // RNRB domains (new)
  'rnrb.me',
  'www.rnrb.me',
  'rnrb.app',
  'www.rnrb.app',
  'rnrb.rocks',
  'www.rnrb.rocks',
  'rnrb.pro',
  'www.rnrb.pro',
  'rnrb.live',
  'www.rnrb.live',
  'rnrb.club',
  'www.rnrb.club',
  'rnrb.chat',
  'www.rnrb.chat',
  'rnrb.art',
  'www.rnrb.art',
  'rnrb.wtf',
  'www.rnrb.wtf',
  'rocknrollbasement.com',
  'www.rocknrollbasement.com',
  // Development
  'localhost',
  'localhost:3000',
  'localhost:3001',
  '127.0.0.1',
  '127.0.0.1:3000',
  '127.0.0.1:3001',
];

// Domains that support wildcard subdomains for artist sites
const ARTIST_SITE_DOMAINS = [
  'rnrb.band', // artistname.rnrb.band → artist website
];

// Domains that support wildcard subdomains for public profiles
const PROFILE_DOMAINS = [
  'rnrb.bio', // artistname.rnrb.bio → public profile
];

// The canonical CronkWaters origin for internal API calls
// Custom domains must route API lookups to the main CronkWaters origin
const CRONKWATERS_ORIGIN =
  process.env.NODE_ENV === 'production' ? 'https://www.cronkwaters.com' : 'http://localhost:3001';

// Routes that require authentication
const protectedPaths = [
  '/admin',
  '/dashboard',
  '/projects',
  '/library',
  '/collaboration',
  '/collaboration-needs',
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
  // NOTE: '/u' (public profiles) is intentionally NOT protected
  '/discover',
  '/feed',
  '/auth-test',
  '/posthog-test',
  '/sites',
  '/studio',
  '/explore',
  '/create',
  '/songs',
  '/credits',
  '/onboarding',
  '/community',
  '/marketplace',
  '/my-merch',
  '/merch',
  '/meet',
  '/masterclasses',
  '/network',
  '/notifications',
  '/opportunities',
  '/social',
  '/tools',
  '/help',
  '/revenue',
];

// Routes that should redirect to dashboard if already authenticated
const authPaths = ['/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // ============================================
  // RNRB WILDCARD SUBDOMAIN ROUTING
  // ============================================
  // Check for *.rnrb.band (artist websites)
  for (const domain of ARTIST_SITE_DOMAINS) {
    if (hostname.endsWith(`.${domain}`)) {
      const subdomain = hostname.replace(`.${domain}`, '');
      if (subdomain && subdomain !== 'www') {
        // Rewrite artistname.rnrb.band → /s/artistname
        const url = request.nextUrl.clone();
        url.pathname = `/s/${subdomain}${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // Check for *.rnrb.bio (public profiles)
  for (const domain of PROFILE_DOMAINS) {
    if (hostname.endsWith(`.${domain}`)) {
      const username = hostname.replace(`.${domain}`, '');
      if (username && username !== 'www') {
        // Rewrite artistname.rnrb.bio → /u/artistname
        const url = request.nextUrl.clone();
        url.pathname = `/u/${username}${pathname === '/' ? '' : pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // ============================================
  // CUSTOM DOMAIN ROUTING
  // ============================================
  // Check if this is a custom domain (not a known CronkWaters/RNRB domain)
  const isKnownDomain = KNOWN_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );

  // Also check if it's a wildcard RNRB subdomain (already handled above)
  const isRnrbSubdomain =
    ARTIST_SITE_DOMAINS.some((d) => hostname.endsWith(`.${d}`)) ||
    PROFILE_DOMAINS.some((d) => hostname.endsWith(`.${d}`));

  if (!isKnownDomain && !isRnrbSubdomain && hostname && !hostname.includes('vercel')) {
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
  // CSRF PROTECTION FOR API MUTATIONS
  // ============================================
  const isApiMutation =
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);

  if (isApiMutation) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    // Webhooks and external callbacks don't send Origin headers
    const isWebhook =
      pathname.includes('/webhook') ||
      pathname.includes('/callback') ||
      pathname.startsWith('/api/trpc');

    if (!isWebhook && process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        'https://cronkwaters.com',
        'https://www.cronkwaters.com',
        'https://rnrb.me',
        'https://www.rnrb.me',
        'https://rnrb.app',
        'https://www.rnrb.app',
        'https://rnrb.rocks',
        'https://www.rnrb.rocks',
        'https://rocknrollbasement.com',
        'https://www.rocknrollbasement.com',
        process.env.NEXTAUTH_URL,
        process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean) as string[];

      const originValid =
        origin && allowedOrigins.some((allowed) => origin.startsWith(allowed));
      const refererValid =
        referer && allowedOrigins.some((allowed) => referer.startsWith(allowed));

      if (!originValid && !refererValid) {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        );
      }
    }
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
