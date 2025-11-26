import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function POST(request: NextRequest) {
  try {
    // Check authentication using NextAuth
    const user = await requireAuth();

    // ✅ SECURITY: Video calls are Studio-tier only
    try {
      await requireFeatureAccess('videoCalls');
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || 'Upgrade to Studio plan to access video calls',
          requiresUpgrade: true,
          currentTier: error.tier || 'free',
          requiredTier: 'studio',
        },
        { status: 403 }
      );
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json({ error: 'Daily API key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { name, privacy = 'private', properties = {} } = body;

    // Create a Daily room
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name,
        privacy,
        properties: {
          enable_recording: true,
          enable_live_streaming: true,
          enable_chat: true,
          enable_screenshare: true,
          max_participants: 50,
          ...properties,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create room' }));
      return NextResponse.json(
        { error: error.error || 'Failed to create room' },
        { status: response.status }
      );
    }

    const room = await response.json();

    // Generate a meeting token for the user
    const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: room.name,
          user_name: user.name || user.email || 'User',
          user_id: user.id,
          enable_recording: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse
        .json()
        .catch(() => ({ error: 'Failed to create meeting token' }));
      return NextResponse.json(
        { error: error.error || 'Failed to create meeting token' },
        { status: tokenResponse.status }
      );
    }

    const { token } = await tokenResponse.json();

    return NextResponse.json({
      room,
      token,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/daily/rooms', method: 'POST' });
  }
}

export async function GET() {
  try {
    // Check authentication using NextAuth
    await requireAuth();

    // ✅ SECURITY: Video calls are Studio-tier only (check access before API call)
    try {
      await requireFeatureAccess('videoCalls');
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || 'Upgrade to Studio plan to access video calls',
          requiresUpgrade: true,
          currentTier: error.tier || 'free',
          requiredTier: 'studio',
        },
        { status: 403 }
      );
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json({ error: 'Daily API key not configured' }, { status: 500 });
    }

    // Get rooms list
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch rooms' }));
      return NextResponse.json(
        { error: error.error || 'Failed to fetch rooms' },
        { status: response.status }
      );
    }

    const { data } = await response.json();
    return NextResponse.json({ rooms: data });
  } catch (error) {
    return handleApiError(error, { route: '/api/daily/rooms', method: 'GET' });
  }
}
