import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';

import { authOptions } from '@/lib/auth';

// Meta (Facebook/Instagram) OAuth
const META_APP_ID = process.env.FACEBOOK_APP_ID || '';
const META_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/social/callback/facebook`;

// Scopes for Facebook Pages and Instagram Business
const META_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
  'business_management',
].join(',');

// GET /api/social/connect/facebook - Initiate Facebook OAuth
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    if (!META_APP_ID) {
      console.error('Facebook App ID not configured');
      return NextResponse.redirect(new URL('/share?error=facebook_not_configured', req.url));
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Store state and user ID in cookie
    const cookieData = JSON.stringify({
      state,
      userId: session.user.id,
    });

    // Build Facebook OAuth URL
    const params = new URLSearchParams({
      client_id: META_APP_ID,
      redirect_uri: META_REDIRECT_URI,
      scope: META_SCOPES,
      response_type: 'code',
      state,
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('facebook_oauth', cookieData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Facebook OAuth error:', error);
    return NextResponse.redirect(new URL('/share?error=oauth_failed', req.url));
  }
}
