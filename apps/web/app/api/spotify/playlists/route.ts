import { type NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/spotify/playlists
 * Fetch user's Spotify playlists
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('token');

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 });
    }

    // Fetch user's playlists
    const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!playlistsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch playlists from Spotify' },
        { status: playlistsResponse.status }
      );
    }

    const playlistsData = await playlistsResponse.json();

    return NextResponse.json({ playlists: playlistsData.items });
  } catch (error) {
    console.error('Spotify playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}
