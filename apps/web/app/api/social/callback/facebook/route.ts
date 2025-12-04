import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

const META_APP_ID = process.env.FACEBOOK_APP_ID || '';
const META_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const META_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/social/callback/facebook`;

// GET /api/social/callback/facebook - Handle Facebook OAuth callback
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Facebook OAuth error:', error);
      return NextResponse.redirect(new URL(`/share?error=facebook_${error}`, req.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/share?error=missing_params', req.url));
    }

    // Get stored OAuth data from cookie
    const oauthCookie = req.cookies.get('facebook_oauth');
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
    const tokenParams = new URLSearchParams({
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      redirect_uri: META_REDIRECT_URI,
      code,
    });

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams.toString()}`
    );

    if (!tokenResponse.ok) {
      console.error('Facebook token error');
      return NextResponse.redirect(new URL('/share?error=token_exchange_failed', req.url));
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${tokens.access_token}`
    );

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/share?error=user_fetch_failed', req.url));
    }

    const userData = await userResponse.json();

    // Get user's Facebook Pages (required for posting)
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${tokens.access_token}`
    );

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    const supabase = await createServerSupabaseClient();

    // Store Facebook user connection
    await supabase.from('social_connections').upsert(
      {
        user_id: oauthData.userId,
        platform: 'facebook',
        platform_user_id: userData.id,
        platform_username: userData.name,
        platform_display_name: userData.name,
        platform_avatar_url: userData.picture?.data?.url,
        access_token: tokens.access_token,
        token_expires_at: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        account_type: 'personal',
        is_active: true,
        connection_metadata: { pages: pages.map((p: any) => ({ id: p.id, name: p.name })) },
      },
      { onConflict: 'user_id,platform,platform_user_id' }
    );

    // Store each Facebook Page as a separate connection (for posting)
    for (const page of pages) {
      await supabase.from('social_connections').upsert(
        {
          user_id: oauthData.userId,
          platform: 'facebook',
          platform_user_id: `page_${page.id}`,
          platform_username: page.name,
          platform_display_name: page.name,
          access_token: tokens.access_token,
          page_id: page.id,
          page_name: page.name,
          page_access_token: page.access_token,
          account_type: 'page',
          is_active: true,
        },
        { onConflict: 'user_id,platform,platform_user_id' }
      );

      // If page has Instagram business account, store that too
      if (page.instagram_business_account) {
        // Get Instagram account details
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.instagram_business_account.id}?fields=id,username,name,profile_picture_url&access_token=${page.access_token}`
        );

        if (igResponse.ok) {
          const igData = await igResponse.json();

          await supabase.from('social_connections').upsert(
            {
              user_id: oauthData.userId,
              platform: 'instagram',
              platform_user_id: igData.id,
              platform_username: igData.username,
              platform_display_name: igData.name || igData.username,
              platform_avatar_url: igData.profile_picture_url,
              access_token: page.access_token, // Use page access token for IG
              page_id: page.id, // Facebook page ID needed for posting
              account_type: 'business',
              is_active: true,
            },
            { onConflict: 'user_id,platform,platform_user_id' }
          );
        }
      }
    }

    const response = NextResponse.redirect(new URL('/share?connected=facebook', req.url));
    response.cookies.delete('facebook_oauth');

    return response;
  } catch (error) {
    console.error('Facebook callback error:', error);
    return NextResponse.redirect(new URL('/share?error=callback_failed', req.url));
  }
}
