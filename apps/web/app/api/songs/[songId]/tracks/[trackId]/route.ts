import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/songs/[songId]/tracks/[trackId]
 * Get a specific track with full details including waveform
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string; trackId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId, trackId } = await params;
    const userId = session.user.id;

    // Check access
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: { where: { userId } },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const hasAccess =
      song.userId === userId ||
      (song.project && song.project.members.length > 0) ||
      song.visibility === 'public';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get track with full details
    const track = await db.songTrack.findUnique({
      where: { id: trackId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!track || track.songId !== songId) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return NextResponse.json({ track });
  } catch (error) {
    console.error('GET /api/songs/[songId]/tracks/[trackId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
  }
}

/**
 * PATCH /api/songs/[songId]/tracks/[trackId]
 * Update track properties
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string; trackId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId, trackId } = await params;
    const userId = session.user.id;
    const body = await req.json();

    // Check access
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: { where: { userId } },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const canEdit =
      song.userId === userId || (song.project && song.project.members.length > 0);

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update track
    const track = await db.songTrack.update({
      where: { id: trackId },
      data: {
        ...(body.trackName && { trackName: body.trackName }),
        ...(body.volume !== undefined && { volume: body.volume }),
        ...(body.pan !== undefined && { pan: body.pan }),
        ...(body.solo !== undefined && { solo: body.solo }),
        ...(body.mute !== undefined && { mute: body.mute }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.color && { color: body.color }),
      },
    });

    return NextResponse.json({ track });
  } catch (error) {
    console.error('PATCH /api/songs/[songId]/tracks/[trackId] error:', error);
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
  }
}

/**
 * DELETE /api/songs/[songId]/tracks/[trackId]
 * Delete a track
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string; trackId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId, trackId } = await params;
    const userId = session.user.id;

    // Check access
    const song = await db.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    if (song.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await db.songTrack.delete({
      where: { id: trackId },
    });

    return NextResponse.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/songs/[songId]/tracks/[trackId] error:', error);
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
  }
}

