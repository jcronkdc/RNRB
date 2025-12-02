/**
 * Single Meeting API
 *
 * GET /api/meet/[meetingCode] - Get meeting details
 * PATCH /api/meet/[meetingCode] - Update meeting
 * DELETE /api/meet/[meetingCode] - Cancel/delete meeting
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { deleteMeetingRoom, getMeetingToken } from '@/lib/daily';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { meetingCode } = await params;

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT 
        m.*,
        u.name as organizer_name,
        u.image as organizer_avatar,
        u.email as organizer_email
      FROM meetings m
      JOIN "User" u ON m.organizer_id = u.id
      WHERE m.meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Check if user can access
    let user;
    try {
      user = await requireAuth();
    } catch {
      // Anonymous user - only allow public meetings
      if (meeting.visibility !== 'public') {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
    }

    // Get participants
    const participants = await db.$queryRaw<any[]>`
      SELECT 
        mp.*,
        u.name as user_name,
        u.image as user_avatar
      FROM meeting_participants mp
      LEFT JOIN "User" u ON mp.user_id = u.id
      WHERE mp.meeting_id = ${meeting.id}::uuid
      ORDER BY 
        CASE mp.role 
          WHEN 'organizer' THEN 0 
          WHEN 'co_host' THEN 1 
          ELSE 2 
        END,
        mp.joined_at DESC NULLS LAST
    `;

    // Check user's role in this meeting
    const myParticipant = user
      ? participants.find((p) => p.user_id === user.id || p.email === user.email)
      : null;

    // Generate Daily.co token if user is a participant
    let dailyToken = null;
    if (user && meeting.daily_room_name && (myParticipant || meeting.visibility === 'public')) {
      try {
        dailyToken = await getMeetingToken(meeting.daily_room_name, {
          userId: user.id,
          userName: user.name || 'Guest',
          isOwner: myParticipant?.role === 'organizer' || myParticipant?.role === 'co_host',
        });
      } catch (err) {
        console.error('Failed to generate Daily token:', err);
      }
    }

    return NextResponse.json({
      meeting: {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        type: meeting.type,
        status: meeting.status,
        meetingCode: meeting.meeting_code,
        joinUrl: meeting.join_url,
        dailyRoomUrl: meeting.daily_room_url,
        dailyToken,
        scheduledStartAt: meeting.scheduled_start_at,
        scheduledEndAt: meeting.scheduled_end_at,
        actualStartAt: meeting.actual_start_at,
        actualEndAt: meeting.actual_end_at,
        timezone: meeting.timezone,
        visibility: meeting.visibility,
        hasPassword: !!meeting.password,
        organizer: {
          id: meeting.organizer_id,
          name: meeting.organizer_name,
          avatar: meeting.organizer_avatar,
        },
        settings: {
          maxParticipants: meeting.max_participants,
          videoEnabled: meeting.video_enabled,
          audioEnabled: meeting.audio_enabled,
          screenShareEnabled: meeting.screen_share_enabled,
          chatEnabled: meeting.chat_enabled,
          recordingEnabled: meeting.recording_enabled,
          waitingRoomEnabled: meeting.waiting_room_enabled,
          fileSharingEnabled: meeting.file_sharing_enabled,
          platformAudioEnabled: meeting.platform_audio_enabled,
        },
        sharedFiles: meeting.shared_files || [],
        createdAt: meeting.created_at,
      },
      participants: participants.map((p) => ({
        id: p.id,
        userId: p.user_id,
        name: p.user_name || p.name,
        email: p.email,
        avatar: p.user_avatar,
        role: p.role,
        inviteStatus: p.invite_status,
        joinedAt: p.joined_at,
        leftAt: p.left_at,
        isOnline: p.joined_at && !p.left_at,
        videoOn: p.video_on,
        audioOn: p.audio_on,
        screenSharing: p.screen_sharing,
        handRaised: p.hand_raised,
      })),
      myRole: myParticipant?.role || (meeting.visibility === 'public' ? 'participant' : null),
      canJoin: !!myParticipant || meeting.visibility === 'public',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]', method: 'GET' });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const body = await request.json();

    // Verify ownership or co-host
    const meetings = await db.$queryRaw<any[]>`
      SELECT m.*, mp.role
      FROM meetings m
      LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id AND mp.user_id = ${user.id}
      WHERE m.meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];
    const isOrganizer = meeting.organizer_id === user.id;
    const isCoHost = meeting.role === 'co_host';

    if (!isOrganizer && !isCoHost) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const {
      title,
      description,
      status,
      scheduledStartAt,
      scheduledEndAt,
      password,
      waitingRoomEnabled,
      videoEnabled,
      audioEnabled,
      screenShareEnabled,
      chatEnabled,
      recordingEnabled,
    } = body;

    // Handle status changes
    if (status === 'active' && meeting.status !== 'active') {
      await db.$executeRaw`
        UPDATE meetings 
        SET status = 'active', actual_start_at = NOW(), updated_at = NOW()
        WHERE id = ${meeting.id}::uuid
      `;
    } else if (status === 'ended' && meeting.status === 'active') {
      await db.$executeRaw`
        UPDATE meetings 
        SET status = 'ended', actual_end_at = NOW(), updated_at = NOW()
        WHERE id = ${meeting.id}::uuid
      `;

      // Mark all participants as left
      await db.$executeRaw`
        UPDATE meeting_participants 
        SET left_at = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW() - joined_at))::integer
        WHERE meeting_id = ${meeting.id}::uuid AND left_at IS NULL
      `;
    }

    // Update other fields
    await db.$executeRaw`
      UPDATE meetings SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        scheduled_start_at = COALESCE(${scheduledStartAt ? new Date(scheduledStartAt) : null}, scheduled_start_at),
        scheduled_end_at = COALESCE(${scheduledEndAt ? new Date(scheduledEndAt) : null}, scheduled_end_at),
        password = COALESCE(${password}, password),
        waiting_room_enabled = COALESCE(${waitingRoomEnabled}, waiting_room_enabled),
        video_enabled = COALESCE(${videoEnabled}, video_enabled),
        audio_enabled = COALESCE(${audioEnabled}, audio_enabled),
        screen_share_enabled = COALESCE(${screenShareEnabled}, screen_share_enabled),
        chat_enabled = COALESCE(${chatEnabled}, chat_enabled),
        recording_enabled = COALESCE(${recordingEnabled}, recording_enabled),
        updated_at = NOW()
      WHERE id = ${meeting.id}::uuid
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]', method: 'PATCH' });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;

    // Verify ownership
    const meetings = await db.$queryRaw<any[]>`
      SELECT * FROM meetings WHERE meeting_code = ${meetingCode} AND organizer_id = ${user.id}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found or not authorized' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Delete Daily.co room
    if (meeting.daily_room_name) {
      try {
        await deleteMeetingRoom(meeting.daily_room_name);
      } catch (err) {
        console.error('Failed to delete Daily room:', err);
      }
    }

    // Delete meeting (cascades to participants, chat, etc)
    await db.$executeRaw`DELETE FROM meetings WHERE id = ${meeting.id}::uuid`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]', method: 'DELETE' });
  }
}
