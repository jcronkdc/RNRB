import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@cronkwaters/auth';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

/**
 * GET /api/meet/[meetingCode]/breakout
 * List all breakout rooms for a meeting
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;

    // Get meeting
    const meetings = await db.execute(
      `
      SELECT id, host_id FROM meetings
      WHERE code = $1
    `,
      [meetingCode]
    );

    if (meetings.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings.rows[0] as any;

    // Get breakout rooms
    const rooms = await db.execute(
      `
      SELECT 
        br.id,
        br.name,
        br.is_open,
        br.created_at,
        COUNT(brp.id) as participant_count,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', brp.id,
            'user_id', brp.user_id,
            'user_name', u.name,
            'user_avatar', u.avatar_url,
            'joined_at', brp.joined_at
          )
        ) FILTER (WHERE brp.id IS NOT NULL) as participants
      FROM breakout_rooms br
      LEFT JOIN breakout_room_participants brp ON br.id = brp.breakout_room_id AND brp.left_at IS NULL
      LEFT JOIN users u ON brp.user_id = u.id
      WHERE br.meeting_id = $1 AND br.closed_at IS NULL
      GROUP BY br.id, br.name, br.is_open, br.created_at
      ORDER BY br.created_at ASC
    `,
      [meeting.id]
    );

    return NextResponse.json({
      rooms: rooms.rows.map((room: any) => ({
        ...room,
        participants: room.participants || [],
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/breakout', method: 'GET' });
  }
}

/**
 * POST /api/meet/[meetingCode]/breakout
 * Create breakout rooms
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const body = await request.json();
    const { rooms } = body; // Array of room names or count

    // Get meeting
    const meetings = await db.execute(
      `
      SELECT id, host_id FROM meetings
      WHERE code = $1
    `,
      [meetingCode]
    );

    if (meetings.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings.rows[0] as any;

    // Only host can create breakout rooms
    if (meeting.host_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the host can create breakout rooms' },
        { status: 403 }
      );
    }

    // Create rooms
    let roomNames: string[] = [];

    if (Array.isArray(rooms)) {
      roomNames = rooms.map((r: any) => (typeof r === 'string' ? r : r.name));
    } else if (typeof rooms === 'number') {
      // Create N numbered rooms
      for (let i = 1; i <= rooms; i++) {
        roomNames.push(`Room ${i}`);
      }
    } else {
      return NextResponse.json({ error: 'Invalid rooms parameter' }, { status: 400 });
    }

    // Insert rooms
    const createdRooms = [];
    for (const name of roomNames) {
      const result = await db.execute(
        `
        INSERT INTO breakout_rooms (id, meeting_id, name, is_open, created_at)
        VALUES (gen_random_uuid(), $1, $2, false, NOW())
        RETURNING id, name, is_open, created_at
      `,
        [meeting.id, name]
      );

      createdRooms.push({
        ...result.rows[0],
        participant_count: 0,
        participants: [],
      });
    }

    return NextResponse.json({
      rooms: createdRooms,
      message: `Created ${createdRooms.length} breakout room(s)`,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/breakout', method: 'POST' });
  }
}

/**
 * PATCH /api/meet/[meetingCode]/breakout
 * Open/close all breakout rooms
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const body = await request.json();
    const { action } = body; // 'open' | 'close' | 'end'

    // Get meeting
    const meetings = await db.execute(
      `
      SELECT id, host_id FROM meetings
      WHERE code = $1
    `,
      [meetingCode]
    );

    if (meetings.rows.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings.rows[0] as any;

    // Only host can manage breakout rooms
    if (meeting.host_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the host can manage breakout rooms' },
        { status: 403 }
      );
    }

    if (action === 'open') {
      await db.execute(
        `
        UPDATE breakout_rooms
        SET is_open = true, updated_at = NOW()
        WHERE meeting_id = $1 AND closed_at IS NULL
      `,
        [meeting.id]
      );

      return NextResponse.json({
        message: 'Breakout rooms opened',
        action: 'open',
      });
    } else if (action === 'close') {
      await db.execute(
        `
        UPDATE breakout_rooms
        SET is_open = false, updated_at = NOW()
        WHERE meeting_id = $1 AND closed_at IS NULL
      `,
        [meeting.id]
      );

      // Move all participants back to main room
      await db.execute(
        `
        UPDATE breakout_room_participants
        SET left_at = NOW()
        WHERE breakout_room_id IN (
          SELECT id FROM breakout_rooms WHERE meeting_id = $1
        ) AND left_at IS NULL
      `,
        [meeting.id]
      );

      return NextResponse.json({
        message: 'Breakout rooms closed',
        action: 'close',
      });
    } else if (action === 'end') {
      // Close all breakout rooms permanently
      await db.execute(
        `
        UPDATE breakout_rooms
        SET is_open = false, closed_at = NOW(), updated_at = NOW()
        WHERE meeting_id = $1 AND closed_at IS NULL
      `,
        [meeting.id]
      );

      // Move all participants back to main room
      await db.execute(
        `
        UPDATE breakout_room_participants
        SET left_at = NOW()
        WHERE breakout_room_id IN (
          SELECT id FROM breakout_rooms WHERE meeting_id = $1
        ) AND left_at IS NULL
      `,
        [meeting.id]
      );

      return NextResponse.json({
        message: 'Breakout rooms ended',
        action: 'end',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/breakout', method: 'PATCH' });
  }
}
