import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Daily API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, privacy = 'private', properties = {} } = body;

    // Create a Daily room
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
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
      const error = await response.json();
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
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: room.name,
          user_name: session.user.name || 'User',
          user_id: session.user.id,
          enable_recording: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
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
    console.error('Error creating Daily room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Daily API key not configured' },
        { status: 500 }
      );
    }

    // Get rooms list
    const response = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to fetch rooms' },
        { status: response.status }
      );
    }

    const { data } = await response.json();
    return NextResponse.json({ rooms: data });
  } catch (error) {
    console.error('Error fetching Daily rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
