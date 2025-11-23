import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/spotify/auth
 * Initiate Spotify OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL + '/api/spotify/callback';

    if (!clientId) {
      return NextResponse.json({ error: 'Spotify integration not configured' }, { status: 500 });
    }

    const scopes = [
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
    ].join(' ');

    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64');

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('state', state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Spotify auth error:', error);
    return NextResponse.json({ error: 'Failed to initiate Spotify auth' }, { status: 500 });
  }
}
