import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

/**
 * GET /api/spotify/playlists/[id]/tracks
 * Fetch tracks from a Spotify playlist
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('token');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 400 }
      );
    }

    // Fetch playlist tracks
    const tracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${params.id}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!tracksResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch tracks from Spotify' },
        { status: tracksResponse.status }
      );
    }

    const tracksData = await tracksResponse.json();

    // Transform Spotify tracks to our song format
    const songs = tracksData.items
      .filter((item: any) => item.track) // Filter out null tracks
      .map((item: any) => {
        const track = item.track;
        return {
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          duration: Math.floor(track.duration_ms / 1000), // Convert to seconds
          tempo: track.tempo || null, // Spotify doesn't always include tempo
          spotifyId: track.id,
          albumArt: track.album.images[0]?.url || null,
        };
      });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Spotify tracks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}

