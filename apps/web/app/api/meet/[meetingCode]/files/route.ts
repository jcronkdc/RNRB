/**
 * Meeting Files API
 *
 * GET /api/meet/[meetingCode]/files - Get shared files
 * POST /api/meet/[meetingCode]/files - Share a file
 * DELETE /api/meet/[meetingCode]/files - Remove a file
 */

import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

interface RouteParams {
  params: Promise<{ meetingCode: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { meetingCode } = await params;

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id, shared_files FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];
    const files = meeting.shared_files || [];

    return NextResponse.json({ files });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/files', method: 'GET' });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const body = await request.json();

    const { name, url, type, size } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'File name and URL required' }, { status: 400 });
    }

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id, shared_files, file_sharing_enabled FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];

    if (!meeting.file_sharing_enabled) {
      return NextResponse.json({ error: 'File sharing is disabled' }, { status: 403 });
    }

    // Add file to shared_files array
    const newFile = {
      id: `file_${Date.now()}`,
      name,
      url,
      type: type || 'unknown',
      size: size || 0,
      uploadedBy: user.name || 'Guest',
      uploadedById: user.id,
      uploadedAt: new Date().toISOString(),
    };

    const currentFiles = meeting.shared_files || [];
    const updatedFiles = [...currentFiles, newFile];

    await db.$executeRaw`
      UPDATE meetings 
      SET shared_files = ${JSON.stringify(updatedFiles)}::jsonb, updated_at = NOW()
      WHERE id = ${meeting.id}::uuid
    `;

    // Also add as chat message
    await db.$executeRaw`
      INSERT INTO meeting_chat (meeting_id, sender_id, message, message_type, file_url, file_name, file_type)
      VALUES (
        ${meeting.id}::uuid,
        ${user.id},
        ${`Shared a file: ${name}`},
        'file',
        ${url},
        ${name},
        ${type || null}
      )
    `;

    return NextResponse.json({ file: newFile });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/files', method: 'POST' });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { meetingCode } = await params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // Get meeting
    const meetings = await db.$queryRaw<any[]>`
      SELECT id, shared_files, organizer_id FROM meetings WHERE meeting_code = ${meetingCode}
    `;

    if (meetings.length === 0) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const meeting = meetings[0];
    const currentFiles = meeting.shared_files || [];

    // Check if user can delete (organizer or file uploader)
    const fileToDelete = currentFiles.find((f: any) => f.id === fileId);
    if (!fileToDelete) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (meeting.organizer_id !== user.id && fileToDelete.uploadedById !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this file' }, { status: 403 });
    }

    const updatedFiles = currentFiles.filter((f: any) => f.id !== fileId);

    await db.$executeRaw`
      UPDATE meetings 
      SET shared_files = ${JSON.stringify(updatedFiles)}::jsonb, updated_at = NOW()
      WHERE id = ${meeting.id}::uuid
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/meet/[meetingCode]/files', method: 'DELETE' });
  }
}
