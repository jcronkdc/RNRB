import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCSRFToken } from "./lib/csrf";
import { checkRateLimit, RateLimitError } from "./lib/rate-limit";
import { verifyAuthToken, getSessionToken } from "./lib/auth/edge-jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/signin',
    '/api/auth',
    '/privacy',
    '/terms',
    '/donate',
    '/discover'
  ];
  
  // Check if route requires authentication
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Skip auth check for static files
  const isStaticFile = pathname.includes('.');
  
  if (!isPublicRoute && !isStaticFile) {
    // Check authentication using Edge-compatible method
    const cookieHeader = req.headers.get('cookie');
    const sessionToken = getSessionToken(cookieHeader);
    const isAuthenticated = await verifyAuthToken(sessionToken);
    
    if (!isAuthenticated) {
      // No valid session - redirect to auth page
      const url = new URL('/auth', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  const response = NextResponse.next();

  // Rate limiting for auth endpoints (only if configured)
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/auth/")) {
    try {
      const rateLimitResult = await checkRateLimit("auth");
      if (!rateLimitResult.success) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": Math.floor((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        });
      }
    } catch (error) {
      // Log but don't fail if rate limiting isn't configured
      console.warn("Rate limiting error:", error);
      if (error instanceof RateLimitError) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": error.retryAfter.toString(),
          },
        });
      }
    }
  }

  // Generate CSRF token for state-changing requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      await getCSRFToken();
    } catch (error) {
      console.error("CSRF token generation error:", error);
    }
  }

  // Enhanced Content Security Policy
  // Note: Next.js requires 'unsafe-inline' and 'unsafe-eval' for development and hydration
  const isDevelopment = process.env.NODE_ENV === "development";
  const deploymentUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval'" : ""} https://apis.google.com https://accounts.google.com ${deploymentUrl}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com`,
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
    `connect-src 'self' ${deploymentUrl} https://api.cronkwaters.com wss://cronkwaters.com https://accounts.google.com`,
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Temporarily removed upgrade-insecure-requests for debugging
  ].join("; ");

  // Security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "0"); // Disabled in modern browsers, CSP is better
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set("Content-Security-Policy", csp);

  // Additional security headers - commented out temporarily to debug blank page
  // response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  // response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  // response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  // response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

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
    "/((?!_next|favicon|icon|robots\\.txt|sitemap\\.xml|opengraph-image|.*\\.(?:svg|jpg|png)).*)",
  ],
};
