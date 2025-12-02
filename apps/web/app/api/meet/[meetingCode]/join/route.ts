/**
 * Join Meeting API
 *
 * POST /api/meet/[meetingCode]/join - Join a meeting
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { getMeetingToken } from '@/lib/daily';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { meetingCode } = await params;
    const body = await request.json();
    const { password, name: guestName } = body;

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT * FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Check meeting status
    if (meeting.status === 'ended') {
      return NextResponse.json({ error: 'This meeting has ended' }, { status: 410 });
    }

    if (meeting.status === 'cancelled') {
      return NextResponse.json({ error: 'This meeting was cancelled' }, { status: 410 });
    }

    // Check password if required
    if (meeting.password && meeting.password !== password) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }

    // Get user if authenticated
    let user;
    try {
      user = await requireAuth();
    } catch {
      // Guest user
      if (meeting.visibility === 'private' || meeting.visibility === 'invite_only') {
        return NextResponse.json({ error: 'This meeting requires an invitation' }, { status: 403 });
      }
    }

    // Check if user is invited for invite-only meetings
    if (meeting.visibility === 'invite_only' && user) {
      const invites = await db.$queryRaw<any[]>`
        SELECT * FROM meeting_participants 
        WHERE meeting_id = ${meeting.id}::uuid 
        AND (user_id = ${user.id} OR email = ${user.email})
      `;

      if (invites.length === 0) {
        return NextResponse.json(
          { error: 'You need an invitation to join this meeting' },
          { status: 403 }
        );
      }
    }

    // Check participant limit
    const activeCount = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM meeting_participants 
      WHERE meeting_id = ${meeting.id}::uuid AND joined_at IS NOT NULL AND left_at IS NULL
    `;

    if (parseInt(activeCount[0]?.count || '0') >= meeting.max_participants) {
      return NextResponse.json({ error: 'Meeting is at full capacity' }, { status: 429 });
    }

    // Handle waiting room
    if (meeting.waiting_room_enabled) {
      // TODO: Implement waiting room logic
      // For now, just let them in
    }

    const participantName = user?.name || guestName || 'Guest';

    // Add or update participant
    if (user) {
      await db.$executeRaw`
        INSERT INTO meeting_participants (meeting_id, user_id, role, invite_status, joined_at)
        VALUES (${meeting.id}::uuid, ${user.id}, 'participant', 'accepted', NOW())
        ON CONFLICT (meeting_id, user_id)
        DO UPDATE SET 
          joined_at = NOW(),
          left_at = NULL,
          invite_status = 'accepted'
      `;
    }

    // Update meeting to active if it was scheduled
    if (meeting.status === 'scheduled') {
      await db.$executeRaw`
        UPDATE meetings SET status = 'active', actual_start_at = NOW(), updated_at = NOW()
        WHERE id = ${meeting.id}::uuid
      `;
    }

    // Generate Daily.co token
    let dailyToken = null;
    if (meeting.daily_room_name) {
      try {
        const isHost = user && meeting.organizer_id === user.id;
        dailyToken = await getMeetingToken(meeting.daily_room_name, {
          userId: user?.id || `guest_${Date.now()}`,
          userName: participantName,
          isOwner: isHost,
        });
      } catch (err) {
        console.error('Failed to generate Daily token:', err);
      }
    }

    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting.id,
        title: meeting.title,
        dailyRoomUrl: meeting.daily_room_url,
        dailyToken,
        settings: {
          videoEnabled: meeting.video_enabled,
          audioEnabled: meeting.audio_enabled,
          screenShareEnabled: meeting.screen_share_enabled,
          chatEnabled: meeting.chat_enabled,
          recordingEnabled: meeting.recording_enabled,
          fileSharingEnabled: meeting.file_sharing_enabled,
          platformAudioEnabled: meeting.platform_audio_enabled,
        },
      },
      participant: {
        name: participantName,
        role: user?.id === meeting.organizer_id ? 'organizer' : 'participant',
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/join', method: 'POST' });
  }
}
