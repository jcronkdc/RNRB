import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import crypto from 'crypto';

// LinkedIn OAuth 2.0
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/social/callback/linkedin`;

// Scopes for posting
const LINKEDIN_SCOPES = ['openid', 'profile', 'email', 'w_member_social'].join(' ');

// GET /api/social/connect/linkedin - Initiate LinkedIn OAuth
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    if (!LINKEDIN_CLIENT_ID) {
      console.error('LinkedIn Client ID not configured');
      return NextResponse.redirect(new URL('/share?error=linkedin_not_configured', req.url));
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Store state and user ID in cookie
    const cookieData = JSON.stringify({
      state,
      userId: session.user.id,
    });

    // Build LinkedIn OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      scope: LINKEDIN_SCOPES,
      state,
    });

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

    const response = NextResponse.redirect(authUrl);
    response.cookies.set('linkedin_oauth', cookieData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return NextResponse.redirect(new URL('/share?error=oauth_failed', req.url));
  }
}
