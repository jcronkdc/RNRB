import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError, AppError } from '@/lib/errors';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { canReadSong } from '@/lib/song-access';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

type RouteContext = {
  params: Promise<{ songId: string }>;
};

/**
 * POST /api/songs/[songId]/session
 * Create or join an audio session for a song collaboration.
 *
 * This is separate from the general /api/daily/rooms endpoint because:
 * - Song sessions are available to ALL tiers (audio-only for free, video for Creator+)
 * - The room is tied to the song ID for consistent rejoining
 * - Settings are optimized for songwriting (audio-first, small group)
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    await checkRateLimit(standardLimiter, `song-session:${user.id}`);

    // Must have access to the song
    const hasAccess = await canReadSong(songId, user.id);
    if (!hasAccess) {
      throw AppError.forbidden('You do not have access to this song');
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Voice sessions are temporarily unavailable' },
        { status: 503 }
      );
    }

    // Use a deterministic room name based on the song ID
    // so everyone in the same song joins the same room
    const roomName = `song-${songId}`;

    // Try to get existing room first
    let room;
    const existingRoomResponse = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
    });

    if (existingRoomResponse.ok) {
      room = await existingRoomResponse.json();
    } else {
      // Create a new room optimized for songwriting collaboration
      const createResponse = await fetch(`${DAILY_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy: 'private',
          properties: {
            // Audio-first: start with video off by default
            start_video_off: true,
            start_audio_off: false,
            // Songwriting sessions are small groups
            max_participants: 6,
            // Enable recording for capturing rough takes
            enable_recording: false, // Keep off for free tier
            enable_chat: true,
            enable_screenshare: false, // Not needed for songwriting
            // Auto-expire after 24 hours of inactivity
            exp: Math.floor(Date.now() / 1000) + 86400,
          },
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json().catch(() => ({ error: 'Failed to create session' }));
        return NextResponse.json(
          { error: error.error || 'Failed to create session' },
          { status: createResponse.status }
        );
      }

      room = await createResponse.json();
    }

    // Generate a meeting token for this user
    const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: user.name || user.email?.split('@')[0] || 'Songwriter',
          user_id: user.id,
          // Audio-first: start with video off
          start_video_off: true,
          start_audio_off: false,
          // Token valid for 24 hours
          exp: Math.floor(Date.now() / 1000) + 86400,
        },
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json().catch(() => ({ error: 'Failed to create token' }));
      return NextResponse.json(
        { error: error.error || 'Failed to create session token' },
        { status: tokenResponse.status }
      );
    }

    const { token } = await tokenResponse.json();

    return NextResponse.json({
      roomUrl: room.url,
      roomName: room.name,
      token,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]/session', method: 'POST' });
  }
}
