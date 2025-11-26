import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

/**
 * AUTH CALLBACK ROUTE
 * 
 * This route handles OAuth callbacks.
 * 
 * NOTE: NextAuth v5 handles its own callbacks at /api/auth/callback/*
 * This route exists for legacy compatibility and general auth redirects.
 * 
 * If you're coming from a magic link or OAuth flow, NextAuth handles it automatically.
 * This route redirects any direct access to the dashboard.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get('error');

  // If there's an error, redirect to auth page with error
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}`, requestUrl.origin)
    );
  }

  // For successful auth, redirect to dashboard
  // NextAuth handles the session cookie automatically via /api/auth/callback/*
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
