/**
 * Leave Meeting API
 *
 * POST /api/meet/[meetingCode]/leave - Leave a meeting
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Update participant
    await db.$executeRaw`
      UPDATE meeting_participants 
      SET 
        left_at = NOW(),
        duration_seconds = EXTRACT(EPOCH FROM (NOW() - joined_at))::integer
      WHERE meeting_id = ${meeting.id}::uuid 
      AND user_id = ${user.id}
      AND left_at IS NULL
    `;

    // Check if meeting should end (all participants left)
    const activeParticipants = await db.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM meeting_participants 
      WHERE meeting_id = ${meeting.id}::uuid 
      AND joined_at IS NOT NULL 
      AND left_at IS NULL
    `;

    if (parseInt(activeParticipants[0]?.count || '0') === 0) {
      // No one left, end the meeting after a delay (handled by client or cron)
      // For now, we'll let it stay active so the organizer can rejoin
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/leave', method: 'POST' });
  }
}
