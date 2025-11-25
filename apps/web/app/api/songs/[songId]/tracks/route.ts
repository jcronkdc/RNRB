import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/songs/[songId]/tracks
 * Get all tracks (stems) for a song
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
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

    // Get all tracks
    const tracks = await db.songTrack.findMany({
      where: { songId },
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
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      songId,
      songTitle: song.title,
      tracks: tracks.map((t) => ({
        id: t.id,
        trackName: t.trackName,
        trackType: t.trackType,
        audioUrl: t.audioUrl,
        duration: t.duration,
        hasWaveform: !!t.waveformData,
        volume: t.volume,
        pan: t.pan,
        solo: t.solo,
        mute: t.mute,
        order: t.order,
        color: t.color,
        uploadedBy: t.uploadedBy,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('GET /api/songs/[songId]/tracks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}

/**
 * POST /api/songs/[songId]/tracks
 * Upload a new track (stem)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const {
      trackName,
      trackType,
      audioUrl,
      audioPath,
      duration,
      waveformData,
      color,
      versionId,
    } = body;

    // Validate required fields
    if (!trackName || !trackType || !audioUrl || !audioPath) {
      return NextResponse.json(
        { error: 'Missing required fields: trackName, trackType, audioUrl, audioPath' },
        { status: 400 }
      );
    }

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

    // Get next order number
    const lastTrack = await db.songTrack.findFirst({
      where: { songId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = (lastTrack?.order || 0) + 1;

    // Create track
    const track = await db.songTrack.create({
      data: {
        songId,
        versionId: versionId || null,
        trackName,
        trackType,
        audioUrl,
        audioPath,
        duration: duration || null,
        waveformData: waveformData || null,
        volume: 1.0,
        pan: 0.0,
        solo: false,
        mute: false,
        order: nextOrder,
        color: color || null,
        uploadedById: userId,
      },
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

    return NextResponse.json(
      {
        track: {
          id: track.id,
          trackName: track.trackName,
          trackType: track.trackType,
          audioUrl: track.audioUrl,
          duration: track.duration,
          order: track.order,
          uploadedBy: track.uploadedBy,
          createdAt: track.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/songs/[songId]/tracks error:', error);
    return NextResponse.json({ error: 'Failed to create track' }, { status: 500 });
  }
}

/**
 * PATCH /api/songs/[songId]/tracks
 * Bulk update track mix parameters or order
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { updates } = body; // Array of { trackId, volume, pan, solo, mute, order }

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

    // Bulk update tracks
    const updatePromises = updates.map((update: any) => {
      const { trackId, ...data } = update;
      return db.songTrack.update({
        where: { id: trackId },
        data,
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Tracks updated successfully', count: updates.length });
  } catch (error) {
    console.error('PATCH /api/songs/[songId]/tracks error:', error);
    return NextResponse.json({ error: 'Failed to update tracks' }, { status: 500 });
  }
}

