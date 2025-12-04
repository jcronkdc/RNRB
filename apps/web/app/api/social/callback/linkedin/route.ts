import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchWithTimeout, TIMEOUT_PRESETS } from '@/lib/fetch-with-timeout';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const LINKEDIN_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/social/callback/linkedin`;

// GET /api/social/callback/linkedin - Handle LinkedIn OAuth callback
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('LinkedIn OAuth error:', error);
      return NextResponse.redirect(new URL(`/share?error=linkedin_${error}`, req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/share?error=missing_params', req.url));
    }

    // Get stored OAuth data from cookie
    const oauthCookie = req.cookies.get('linkedin_oauth');
    if (!oauthCookie?.value) {
      return NextResponse.redirect(new URL('/share?error=session_expired', req.url));
    }

    let oauthData;
    try {
      oauthData = JSON.parse(oauthCookie.value);
    } catch {
      return NextResponse.redirect(new URL('/share?error=invalid_session', req.url));
    }

    if (state !== oauthData.state) {
      return NextResponse.redirect(new URL('/share?error=invalid_state', req.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetchWithTimeout('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
      timeout: TIMEOUT_PRESETS.SLOW, // 30s for OAuth
    });

    if (!tokenResponse.ok) {
      console.error('LinkedIn token error');
      return NextResponse.redirect(new URL('/share?error=token_exchange_failed', req.url));
    }

    const tokens = await tokenResponse.json();

    // Get user info using the new userinfo endpoint
    const userResponse = await fetchWithTimeout('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      timeout: TIMEOUT_PRESETS.SLOW, // 30s for external API
    });

    if (!userResponse.ok) {
      console.error('LinkedIn user fetch error');
      return NextResponse.redirect(new URL('/share?error=user_fetch_failed', req.url));
    }

    const userData = await userResponse.json();

    const supabase = await createServerSupabaseClient();

    // Store LinkedIn connection
    const { error: dbError } = await supabase.from('social_connections').upsert(
      {
        user_id: oauthData.userId,
        platform: 'linkedin',
        platform_user_id: userData.sub,
        platform_username: userData.email || userData.name,
        platform_display_name: userData.name,
        platform_avatar_url: userData.picture,
        access_token: tokens.access_token,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        token_scope: tokens.scope,
        is_active: true,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform,platform_user_id' }
    );

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(new URL('/share?error=database_error', req.url));
    }

    const response = NextResponse.redirect(new URL('/share?connected=linkedin', req.url));
    response.cookies.delete('linkedin_oauth');

    return response;
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.redirect(new URL('/share?error=callback_failed', req.url));
  }
}
