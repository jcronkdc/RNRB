/**
 * Voice Room API
 *
 * Creates and manages Discord-style voice rooms
 * Uses Daily.co for WebRTC infrastructure
 *
 * POST /api/rooms/voice - Create or join voice room
 * GET /api/rooms/voice/[roomId] - Get room details
 * DELETE /api/rooms/voice/[roomId] - End room
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { prisma as db } from '@cronkwaters/db';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Daily.co not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { roomName, maxParticipants = 32, enableVideo = false, spatialAudio = false } = body;

    if (!roomName) {
      return NextResponse.json({ error: 'roomName required' }, { status: 400 });
    }

    // Check if room already exists in our database
    let existingRoom = await db.collaborationRoom.findFirst({
      where: {
        channelId: roomName,
        status: 'active',
      },
    });

    let dailyRoomUrl: string;

    if (existingRoom && existingRoom.dailyRoomId) {
      // Room exists, get Daily.co room details
      const response = await fetch(`${DAILY_API_URL}/rooms/${existingRoom.dailyRoomId}`, {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      });

      if (response.ok) {
        const dailyRoom = await response.json();
        dailyRoomUrl = dailyRoom.url;
      } else {
        // Daily room doesn't exist anymore, create new one
        existingRoom = null;
      }
    }

    if (!existingRoom) {
      // Create new Daily.co room
      const dailyResponse = await fetch(`${DAILY_API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: `voice-${roomName}-${Date.now()}`,
          properties: {
            max_participants: maxParticipants,
            enable_screenshare: false,
            enable_chat: false,
            enable_knocking: false,
            enable_prejoin_ui: false,
            start_video_off: !enableVideo,
            start_audio_off: false,
            enable_recording: 'local', // Allow local recording
            enable_network_ui: true,
          },
        }),
      });

      if (!dailyResponse.ok) {
        const error = await dailyResponse.json();
        console.error('Daily.co error:', error);
        return NextResponse.json(
          { error: 'Failed to create Daily.co room' },
          { status: 500 }
        );
      }

      const dailyRoom = await dailyResponse.json();
      dailyRoomUrl = dailyRoom.url;

      // Save room to database
      existingRoom = await db.collaborationRoom.create({
        data: {
          name: roomName,
          type: 'voice_only',
          channelId: roomName,
          dailyRoomId: dailyRoom.name,
          maxParticipants,
          enableVideo,
          enableAudio: true,
          enableScreenShare: false,
          spatialAudio,
          status: 'active',
          createdById: user.id,
          startedAt: new Date(),
        },
      });
    }

    // Create room session for this user
    await db.roomSession.create({
      data: {
        roomId: existingRoom.id,
        userId: user.id,
        userName: user.user_metadata?.name || user.email || 'Unknown',
        userAvatar: user.user_metadata?.avatar_url,
        videoEnabled: enableVideo,
        audioEnabled: true,
      },
    });

    return NextResponse.json({
      roomId: existingRoom.id,
      roomUrl: dailyRoomUrl,
      roomName: existingRoom.name,
    });
  } catch (error) {
    console.error('Voice room API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get active voice room details
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'channelId required' }, { status: 400 });
    }

    const room = await db.collaborationRoom.findFirst({
      where: {
        channelId,
        status: 'active',
      },
      include: {
        sessions: {
          where: {
            leftAt: null, // Only active sessions
          },
          select: {
            id: true,
            userId: true,
            userName: true,
            userAvatar: true,
            videoEnabled: true,
            audioEnabled: true,
            joinedAt: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ room: null });
    }

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        activeParticipants: room.sessions.length,
        participants: room.sessions,
        startedAt: room.startedAt,
      },
    });
  } catch (error) {
    console.error('Get voice room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

