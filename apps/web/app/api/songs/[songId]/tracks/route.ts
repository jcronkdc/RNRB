import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { checkRateLimit, standardLimiter, uploadLimiter } from '@/lib/rate-limit';

// Validation schema for creating tracks
// TrackType values must match Prisma enum values
const createTrackSchema = z.object({
  trackName: z.string().min(1).max(100),
  trackType: z.enum([
    'vocal_lead',
    'vocal_harmony',
    'vocal_backing',
    'guitar_electric',
    'guitar_acoustic',
    'guitar_bass',
    'drums',
    'percussion',
    'piano',
    'synth',
    'strings',
    'brass',
    'woodwind',
    'fx',
    'master',
    'other',
  ]),
  audioUrl: z.string().url(),
  audioPath: z.string().min(1),
  duration: z.number().positive().optional(),
  waveformData: z.any().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  versionId: z.string().optional(),
});

// Validation schema for bulk updates
const bulkUpdateSchema = z.object({
  updates: z
    .array(
      z.object({
        trackId: z.string(),
        volume: z.number().min(0).max(2).optional(),
        pan: z.number().min(-1).max(1).optional(),
        solo: z.boolean().optional(),
        mute: z.boolean().optional(),
        order: z.number().int().min(0).optional(),
      })
    )
    .min(1),
});

/**
 * GET /api/songs/[songId]/tracks
 * Get all tracks (stems) for a song with optimized queries
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ songId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
    const userId = session.user.id;

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `tracks-read:${userId}`);

    // Optimized query - only fetch what we need
    const song = await db.song.findUnique({
      where: { id: songId },
      select: {
        id: true,
        title: true,
        userId: true,
        visibility: true,
        project: {
          select: {
            id: true,
            members: {
              where: { userId },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const hasAccess =
      song.userId === userId ||
      ((song as any).project && (song as any).project.members.length > 0) ||
      song.visibility === 'public';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all tracks with optimized query
    const tracks = await db.songTrack.findMany({
      where: { songId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    const response = NextResponse.json({
      songId,
      songTitle: song.title,
      trackCount: tracks.length,
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

    // Add cache headers for better performance (cache for 30 seconds)
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('GET /api/songs/[songId]/tracks error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch tracks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/songs/[songId]/tracks
 * Upload a new track (stem) with comprehensive validation
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ songId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
    const userId = session.user.id;

    // Rate limit: 30 uploads per minute
    await checkRateLimit(uploadLimiter, `tracks-upload:${userId}`);

    const body = await req.json();

    // Validate input with Zod
    const validatedData = createTrackSchema.parse(body);

    // Check access to song
    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        project: {
          include: {
            members: { where: { userId } },
          },
        },
        tracks: {
          select: { id: true },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const canEdit =
      song.userId === userId || ((song as any).project && (song as any).project.members.length > 0);

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check track limit (example: max 20 tracks per song)
    const MAX_TRACKS = 20;
    if (song.tracks.length >= MAX_TRACKS) {
      return NextResponse.json({ error: `Maximum ${MAX_TRACKS} tracks per song` }, { status: 400 });
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
        versionId: validatedData.versionId || null,
        trackName: validatedData.trackName,
        trackType: validatedData.trackType,
        audioUrl: validatedData.audioUrl,
        audioPath: validatedData.audioPath,
        duration: validatedData.duration || null,
        waveformData: validatedData.waveformData || null,
        volume: 1.0,
        pan: 0.0,
        solo: false,
        mute: false,
        order: nextOrder,
        color: validatedData.color || null,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
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
          color: track.color,
          uploadedBy: track.uploadedBy,
          createdAt: track.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/songs/[songId]/tracks error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create track',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/songs/[songId]/tracks
 * Bulk update track mix parameters or order with validation
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ songId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { songId } = await params;
    const userId = session.user.id;

    // Rate limit: 60 updates per minute (mixing adjustments)
    await checkRateLimit(standardLimiter, `tracks-update:${userId}`);

    const body = await req.json();

    // Validate with Zod
    const validatedData = bulkUpdateSchema.parse(body);

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
      song.userId === userId || ((song as any).project && (song as any).project.members.length > 0);

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify all tracks belong to this song
    const trackIds = validatedData.updates.map((u) => u.trackId);
    const existingTracks = await db.songTrack.findMany({
      where: {
        id: { in: trackIds },
        songId,
      },
      select: { id: true },
    });

    if (existingTracks.length !== trackIds.length) {
      return NextResponse.json(
        { error: 'One or more tracks not found or do not belong to this song' },
        { status: 400 }
      );
    }

    // Bulk update tracks using transaction for consistency
    const results = await db.$transaction(
      validatedData.updates.map((update) => {
        const { trackId, ...data } = update;
        return db.songTrack.update({
          where: { id: trackId },
          data,
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Tracks updated successfully',
      count: results.length,
      updatedTracks: results.map((t) => ({
        id: t.id,
        volume: t.volume,
        pan: t.pan,
        solo: t.solo,
        mute: t.mute,
        order: t.order,
      })),
    });
  } catch (error) {
    console.error('PATCH /api/songs/[songId]/tracks error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update tracks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
