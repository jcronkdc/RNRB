import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  '/auth-test',
  '/posthog-test',
];

// Routes that should redirect to dashboard if already authenticated
const authPaths = ['/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some((path) => 
    pathname.startsWith(path)
  );

  // Check if the current path is an auth page
  const isAuthPath = authPaths.some((path) => 
    pathname.startsWith(path)
  );

  // Skip middleware for non-protected, non-auth paths (like homepage)
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  // Only call auth() when needed (for protected or auth paths)
  const session = await auth();

  // Redirect to /auth if accessing protected path without session
  if (isProtectedPath && !session?.user) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to /dashboard if accessing auth page with valid session
  if (isAuthPath && session?.user) {
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

