/**
 * Meetings API
 *
 * POST /api/meet - Create a new meeting
 * GET /api/meet - Get user's meetings
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { createMeetingRoom } from '@/lib/daily';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const {
      title,
      description,
      type = 'instant',
      scheduledStartAt,
      scheduledEndAt,
      timezone = 'UTC',
      visibility = 'private',
      password,
      waitingRoomEnabled = false,
      maxParticipants = 100,
      videoEnabled = true,
      audioEnabled = true,
      screenShareEnabled = true,
      chatEnabled = true,
      recordingEnabled = false,
      fileSharingEnabled = true,
      platformAudioEnabled = true,
      invitees = [],
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate meeting code
    const meetingCode = await db.$queryRaw<any[]>`SELECT generate_meeting_code() as code`;
    const code =
      meetingCode[0]?.code ||
      `${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;

    // Create Daily.co room
    const dailyRoom = await createMeetingRoom({
      name: code.replace(/-/g, ''),
      privacy: visibility === 'public' ? 'public' : 'private',
      properties: {
        max_participants: maxParticipants,
        enable_recording: recordingEnabled ? 'cloud' : undefined,
        enable_screenshare: screenShareEnabled,
        enable_chat: chatEnabled,
        start_video_off: !videoEnabled,
        start_audio_off: !audioEnabled,
        exp: scheduledEndAt
          ? Math.floor(new Date(scheduledEndAt).getTime() / 1000) + 3600
          : undefined, // Expire 1 hour after scheduled end
      },
    });

    // Create meeting in database
    const meetings = await db.$queryRaw<any[]>`
      INSERT INTO meetings (
        organizer_id,
        title,
        description,
        type,
        status,
        scheduled_start_at,
        scheduled_end_at,
        timezone,
        visibility,
        password,
        waiting_room_enabled,
        meeting_code,
        join_url,
        daily_room_name,
        daily_room_url,
        max_participants,
        video_enabled,
        audio_enabled,
        screen_share_enabled,
        chat_enabled,
        recording_enabled,
        file_sharing_enabled,
        platform_audio_enabled
      ) VALUES (
        ${user.id},
        ${title.trim()},
        ${description || null},
        ${type},
        ${type === 'instant' ? 'active' : 'scheduled'},
        ${scheduledStartAt ? new Date(scheduledStartAt) : null},
        ${scheduledEndAt ? new Date(scheduledEndAt) : null},
        ${timezone},
        ${visibility},
        ${password || null},
        ${waitingRoomEnabled},
        ${code},
        ${`${process.env.NEXT_PUBLIC_APP_URL}/meet/${code}`},
        ${dailyRoom?.name || null},
        ${dailyRoom?.url || null},
        ${maxParticipants},
        ${videoEnabled},
        ${audioEnabled},
        ${screenShareEnabled},
        ${chatEnabled},
        ${recordingEnabled},
        ${fileSharingEnabled},
        ${platformAudioEnabled}
      )
      RETURNING *
    `;

    const meeting = meetings[0];

    // Add organizer as participant
    await db.$executeRaw`
      INSERT INTO meeting_participants (meeting_id, user_id, role, invite_status)
      VALUES (${meeting.id}::uuid, ${user.id}, 'organizer', 'accepted')
    `;

    // Add invitees
    if (invitees.length > 0) {
      for (const invitee of invitees) {
        await db.$executeRaw`
          INSERT INTO meeting_participants (meeting_id, user_id, email, name, role, invite_status)
          VALUES (
            ${meeting.id}::uuid,
            ${invitee.userId || null},
            ${invitee.email || null},
            ${invitee.name || null},
            'participant',
            'pending'
          )
          ON CONFLICT DO NOTHING
        `;
      }

      // TODO: Send email invitations
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
        scheduledStartAt: meeting.scheduled_start_at,
        scheduledEndAt: meeting.scheduled_end_at,
        timezone: meeting.timezone,
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
        createdAt: meeting.created_at,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet', method: 'POST' });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status'); // scheduled, active, ended
    const type = searchParams.get('type'); // upcoming, past, all
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause = `
      WHERE (m.organizer_id = '${user.id}' 
             OR mp.user_id = '${user.id}'
             OR mp.email = '${user.email}')
    `;

    if (status) {
      whereClause += ` AND m.status = '${status}'`;
    }

    if (type === 'upcoming') {
      whereClause += ` AND (m.scheduled_start_at > NOW() OR m.status = 'active')`;
    } else if (type === 'past') {
      whereClause += ` AND m.status = 'ended'`;
    }

    const meetings = await db.$queryRaw<any[]>`
      SELECT DISTINCT
        m.*,
        u.name as organizer_name,
        u.image as organizer_avatar,
        (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id = m.id) as participant_count,
        mp.role as my_role,
        mp.invite_status as my_invite_status
      FROM meetings m
      JOIN "User" u ON m.organizer_id = u.id
      LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id 
        AND (mp.user_id = ${user.id} OR mp.email = ${user.email})
      ${whereClause.includes('WHERE') ? whereClause : ''}
      ORDER BY 
        CASE WHEN m.status = 'active' THEN 0 ELSE 1 END,
        COALESCE(m.scheduled_start_at, m.created_at) DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return NextResponse.json({
      meetings: meetings.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        type: m.type,
        status: m.status,
        meetingCode: m.meeting_code,
        joinUrl: m.join_url,
        scheduledStartAt: m.scheduled_start_at,
        scheduledEndAt: m.scheduled_end_at,
        actualStartAt: m.actual_start_at,
        actualEndAt: m.actual_end_at,
        timezone: m.timezone,
        participantCount: m.participant_count,
        myRole: m.my_role,
        myInviteStatus: m.my_invite_status,
        organizer: {
          id: m.organizer_id,
          name: m.organizer_name,
          avatar: m.organizer_avatar,
        },
        settings: {
          videoEnabled: m.video_enabled,
          audioEnabled: m.audio_enabled,
          screenShareEnabled: m.screen_share_enabled,
          chatEnabled: m.chat_enabled,
          recordingEnabled: m.recording_enabled,
        },
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet', method: 'GET' });
  }
}
