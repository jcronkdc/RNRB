import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import crypto from 'crypto';

import { authOptions } from '@/lib/auth';

// Twitter OAuth 2.0 with PKCE
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const TWITTER_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/social/callback/twitter`;

// Scopes needed for posting
const TWITTER_SCOPES = [
  'tweet.read',
  'tweet.write',
  'users.read',
  'offline.access', // For refresh tokens
].join(' ');

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

// GET /api/social/connect/twitter - Initiate Twitter OAuth
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    if (!TWITTER_CLIENT_ID) {
      console.error('Twitter Client ID not configured');
      return NextResponse.redirect(new URL('/share?error=twitter_not_configured', req.url));
    }

    // Generate PKCE values
    const { verifier, challenge } = generatePKCE();

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');

    // Store verifier and state in a secure cookie (will be validated in callback)
    const cookieData = JSON.stringify({
      verifier,
      state,
      userId: session.user.id,
    });

    // Build Twitter OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: TWITTER_REDIRECT_URI,
      scope: TWITTER_SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

    // Create response with redirect and set cookie
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('twitter_oauth', cookieData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.redirect(new URL('/share?error=oauth_failed', req.url));
  }
}
