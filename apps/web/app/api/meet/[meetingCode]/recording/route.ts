/**
 * Meeting Recording API
 *
 * POST /api/meet/[meetingCode]/recording - Start/stop recording
 * GET /api/meet/[meetingCode]/recording - Get recordings
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { startRecording, stopRecording, listRecordings, getRecording } from '@/lib/daily';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id, daily_room_name, organizer_id FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Check authorization (organizer or participant)
    const participant = await db.$queryRaw<any[]>`
      SELECT role FROM meeting_participants 
      WHERE meeting_id = ${meeting.id}::uuid AND user_id = ${user.id}
    `;

    if (meeting.organizer_id !== user.id && !participant.length) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Get recordings from database
    const recordings = await db.$queryRaw<any[]>`
      SELECT * FROM meeting_recordings 
      WHERE meeting_id = ${meeting.id}::uuid
      ORDER BY created_at DESC
    `;

    // If meeting has Daily room, also fetch from Daily
    let dailyRecordings: any[] = [];
    if (meeting.daily_room_name) {
      try {
        dailyRecordings = await listRecordings(meeting.daily_room_name);
      } catch (err) {
        console.error('Failed to fetch Daily recordings:', err);
      }
    }

    return NextResponse.json({
      recordings: recordings.map((r) => ({
        id: r.id,
        url: r.recording_url,
        type: r.recording_type,
        durationSeconds: r.duration_seconds,
        status: r.status,
        access: r.access,
        createdAt: r.created_at,
        processedAt: r.processed_at,
        expiresAt: r.expires_at,
      })),
      dailyRecordings,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/recording', method: 'GET' });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const body = await request.json();

    const { action } = body; // 'start' or 'stop'

    if (!['start', 'stop'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "start" or "stop"' }, { status: 400 });
    }

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id, daily_room_name, organizer_id, recording_enabled FROM meetings 
      WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    // Check authorization (only organizer or co-host can record)
    if (meeting.organizer_id !== user.id) {
      const participant = await db.$queryRaw<any[]>`
        SELECT role FROM meeting_participants 
        WHERE meeting_id = ${meeting.id}::uuid AND user_id = ${user.id}
      `;

      if (!participant.length || !['organizer', 'co_host'].includes(participant[0].role)) {
        return NextResponse.json(
          { error: 'Only the organizer or co-host can record' },
          { status: 403 }
        );
      }
    }

    if (!meeting.recording_enabled) {
      return NextResponse.json(
        { error: 'Recording is not enabled for this meeting' },
        { status: 403 }
      );
    }

    if (!meeting.daily_room_name) {
      return NextResponse.json({ error: 'No video room configured' }, { status: 400 });
    }

    if (action === 'start') {
      const recordingId = await startRecording(meeting.daily_room_name);

      if (!recordingId) {
        return NextResponse.json({ error: 'Failed to start recording' }, { status: 500 });
      }

      // Save recording to database
      await db.$executeRaw`
        INSERT INTO meeting_recordings (meeting_id, daily_recording_id, status)
        VALUES (${meeting.id}::uuid, ${recordingId}, 'processing')
      `;

      return NextResponse.json({
        success: true,
        recordingId,
        message: 'Recording started',
      });
    } else {
      // Get active recording
      const activeRecordings = await db.$queryRaw<any[]>`
        SELECT daily_recording_id FROM meeting_recordings 
        WHERE meeting_id = ${meeting.id}::uuid AND status = 'processing'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (activeRecordings.length === 0) {
        return NextResponse.json({ error: 'No active recording' }, { status: 400 });
      }

      const recordingId = activeRecordings[0].daily_recording_id;
      const stopped = await stopRecording(recordingId);

      if (!stopped) {
        return NextResponse.json({ error: 'Failed to stop recording' }, { status: 500 });
      }

      // Update recording status
      await db.$executeRaw`
        UPDATE meeting_recordings 
        SET status = 'processing', processed_at = NOW()
        WHERE daily_recording_id = ${recordingId}
      `;

      return NextResponse.json({
        success: true,
        message: 'Recording stopped. Processing will complete shortly.',
      });
    }
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/recording', method: 'POST' });
  }
}
