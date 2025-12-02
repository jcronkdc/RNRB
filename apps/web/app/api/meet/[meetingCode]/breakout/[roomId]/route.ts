import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@cronkwaters/auth';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ meetingCode: string; roomId: string }>;
}

/**
 * POST /api/meet/[meetingCode]/breakout/[roomId]
 * Join a breakout room
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode, roomId } = await params;

    // Verify breakout room exists and is open
    const rooms = await db.execute(
      `
      SELECT br.id, br.meeting_id, br.is_open, m.code
      FROM breakout_rooms br
      INNER JOIN meetings m ON br.meeting_id = m.id
      WHERE br.id = $1 AND m.code = $2
    `,
      [roomId, meetingCode]
    );

    if (rooms.rows.length === 0) {
      return NextResponse.json({ error: 'Breakout room not found' }, { status: 404 });
    }

    const room = rooms.rows[0] as any;

    if (!room.is_open) {
      return NextResponse.json({ error: 'Breakout room is not open' }, { status: 400 });
    }

    // Leave any other breakout rooms first
    await db.execute(
      `
      UPDATE breakout_room_participants
      SET left_at = NOW()
      WHERE user_id = $1 
        AND left_at IS NULL
        AND breakout_room_id IN (
          SELECT id FROM breakout_rooms WHERE meeting_id = $2
        )
    `,
      [user.id, room.meeting_id]
    );

    // Join the new breakout room
    await db.execute(
      `
      INSERT INTO breakout_room_participants (id, breakout_room_id, user_id, joined_at)
      VALUES (gen_random_uuid(), $1, $2, NOW())
    `,
      [roomId, user.id]
    );

    return NextResponse.json({
      message: 'Joined breakout room',
      roomId,
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/meet/[meetingCode]/breakout/[roomId]',
      method: 'POST',
    });
  }
}

/**
 * DELETE /api/meet/[meetingCode]/breakout/[roomId]
 * Leave a breakout room (return to main meeting)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode, roomId } = await params;

    // Update participant record
    await db.execute(
      `
      UPDATE breakout_room_participants
      SET left_at = NOW()
      WHERE user_id = $1 
        AND breakout_room_id = $2 
        AND left_at IS NULL
    `,
      [user.id, roomId]
    );

    return NextResponse.json({
      message: 'Left breakout room',
      roomId,
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/meet/[meetingCode]/breakout/[roomId]',
      method: 'DELETE',
    });
  }
}

/**
 * PATCH /api/meet/[meetingCode]/breakout/[roomId]
 * Update breakout room (rename, etc.) - Host only
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode, roomId } = await params;
    const body = await request.json();
    const { name } = body;

    // Verify user is host
    const rooms = await db.execute(
      `
      SELECT br.id, m.host_id
      FROM breakout_rooms br
      INNER JOIN meetings m ON br.meeting_id = m.id
      WHERE br.id = $1 AND m.code = $2
    `,
      [roomId, meetingCode]
    );

    if (rooms.rows.length === 0) {
      return NextResponse.json({ error: 'Breakout room not found' }, { status: 404 });
    }

    const room = rooms.rows[0] as any;

    if (room.host_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the host can update breakout rooms' },
        { status: 403 }
      );
    }

    // Update room
    const result = await db.execute(
      `
      UPDATE breakout_rooms
      SET name = COALESCE($1, name), updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, is_open
    `,
      [name, roomId]
    );

    return NextResponse.json({
      room: result.rows[0],
    });
  } catch (error) {
    return handleApiError(error, {
      route: '/api/meet/[meetingCode]/breakout/[roomId]',
      method: 'PATCH',
    });
  }
}
