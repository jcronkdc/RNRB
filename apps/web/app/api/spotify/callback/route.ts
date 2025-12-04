import { type NextRequest, NextResponse } from 'next/server';

import { fetchWithTimeout, TIMEOUT_PRESETS } from '@/lib/fetch-with-timeout';

/**
 * GET /api/spotify/callback
 * Handle Spotify OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      // User denied access
      return NextResponse.redirect(new URL('/projects?spotify_error=access_denied', request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/projects?spotify_error=invalid_callback', request.url)
      );
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL + '/api/spotify/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/projects?spotify_error=not_configured', request.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetchWithTimeout('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      timeout: TIMEOUT_PRESETS.SLOW, // 30s for OAuth
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        new URL('/projects?spotify_error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Redirect to playlists page with token
    const redirectUrl = new URL('/spotify/playlists', request.url);
    redirectUrl.searchParams.append('token', accessToken);
    redirectUrl.searchParams.append('state', state);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Spotify callback error:', error);
    return NextResponse.redirect(new URL('/projects?spotify_error=unknown', request.url));
  }
}
