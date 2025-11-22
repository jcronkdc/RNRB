import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireFeatureAccess } from '@/lib/subscription-access';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomName: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      return NextResponse.json(
        { error: 'Daily API key not configured' },
        { status: 500 }
      );
    }

    const { roomName } = await params;

    // Get room details
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to fetch room' },
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
    console.error('Error fetching Daily room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomName: string }> }
) {
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

    const { roomName } = await params;

    // Delete room
    const response = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to delete room' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Daily room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
