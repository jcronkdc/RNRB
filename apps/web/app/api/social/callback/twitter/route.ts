import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchWithTimeout, TIMEOUT_PRESETS } from '@/lib/fetch-with-timeout';

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || '';
const TWITTER_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/social/callback/twitter`;

// GET /api/social/callback/twitter - Handle Twitter OAuth callback
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for errors from Twitter
    if (error) {
      console.error('Twitter OAuth error:', error);
      return NextResponse.redirect(new URL(`/share?error=twitter_${error}`, req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/share?error=missing_params', req.url));
    }

    // Get stored OAuth data from cookie
    const oauthCookie = req.cookies.get('twitter_oauth');
    if (!oauthCookie?.value) {
      return NextResponse.redirect(new URL('/share?error=session_expired', req.url));
    }

    let oauthData;
    try {
      oauthData = JSON.parse(oauthCookie.value);
    } catch {
      return NextResponse.redirect(new URL('/share?error=invalid_session', req.url));
    }

    // Validate state
    if (state !== oauthData.state) {
      return NextResponse.redirect(new URL('/share?error=invalid_state', req.url));
    }

    // Exchange code for tokens
    const tokenResponse = await fetchWithTimeout('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: TWITTER_REDIRECT_URI,
        code_verifier: oauthData.verifier,
      }),
      timeout: TIMEOUT_PRESETS.SLOW, // 30s for OAuth
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Twitter token error:', errorText);
      return NextResponse.redirect(new URL('/share?error=token_exchange_failed', req.url));
    }

    const tokens = await tokenResponse.json();

    // Get user info from Twitter
    const userResponse = await fetchWithTimeout(
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
        timeout: TIMEOUT_PRESETS.SLOW, // 30s for external API
      }
    );

    if (!userResponse.ok) {
      console.error('Twitter user fetch error');
      return NextResponse.redirect(new URL('/share?error=user_fetch_failed', req.url));
    }

    const userData = await userResponse.json();
    const twitterUser = userData.data;

    // Store connection in database
    const supabase = await createServerSupabaseClient();

    const { error: dbError } = await supabase.from('social_connections').upsert(
      {
        user_id: oauthData.userId,
        platform: 'twitter',
        platform_user_id: twitterUser.id,
        platform_username: twitterUser.username,
        platform_display_name: twitterUser.name,
        platform_avatar_url: twitterUser.profile_image_url,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        token_scope: tokens.scope,
        is_active: true,
        last_used_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,platform,platform_user_id',
      }
    );

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(new URL('/share?error=database_error', req.url));
    }

    // Clear the OAuth cookie and redirect to success
    const response = NextResponse.redirect(new URL('/share?connected=twitter', req.url));
    response.cookies.delete('twitter_oauth');

    return response;
  } catch (error) {
    console.error('Twitter callback error:', error);
    return NextResponse.redirect(new URL('/share?error=callback_failed', req.url));
  }
}
