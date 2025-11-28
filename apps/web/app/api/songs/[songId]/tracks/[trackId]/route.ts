import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';
import { db } from '@/lib/db';

// Server-side Supabase client for storage operations
function getSupabaseStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Delete file from Supabase Storage
async function deleteAudioFromStorage(audioPath: string): Promise<boolean> {
  const supabase = getSupabaseStorageClient();
  if (!supabase) {
    console.warn('Supabase not configured, skipping file deletion');
    return false;
  }

  try {
    const { error } = await supabase.storage.from('audio-files').remove([audioPath]);
    if (error) {
      console.error('Failed to delete audio file:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting from storage:', error);
    return false;
  }
}

// Validation schema for track updates
const updateTrackSchema = z.object({
  trackName: z.string().min(1).max(100).optional(),
  volume: z.number().min(0).max(2).optional(),
  pan: z.number().min(-1).max(1).optional(),
  solo: z.boolean().optional(),
  mute: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

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
 * Update track properties with validation
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

    // Validate input
    const validatedData = updateTrackSchema.parse(body);

    // Check if there's anything to update
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    // Check access
    const song = await db.song.findUnique({
      where: { id: songId },
      select: {
        id: true,
        userId: true,
        project: {
          select: {
            members: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const canEdit = song.userId === userId || (song.project && song.project.members.length > 0);

    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify track exists and belongs to song
    const existingTrack = await db.songTrack.findUnique({
      where: { id: trackId },
      select: { songId: true },
    });

    if (!existingTrack || existingTrack.songId !== songId) {
      return NextResponse.json(
        { error: 'Track not found or does not belong to this song' },
        { status: 404 }
      );
    }

    // Update track
    const track = await db.songTrack.update({
      where: { id: trackId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      track: {
        id: track.id,
        trackName: track.trackName,
        volume: track.volume,
        pan: track.pan,
        solo: track.solo,
        mute: track.mute,
        order: track.order,
        color: track.color,
        updatedAt: track.updatedAt,
      },
    });
  } catch (error) {
    console.error('PATCH /api/songs/[songId]/tracks/[trackId] error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update track',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/songs/[songId]/tracks/[trackId]
 * Delete a track with proper validation
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

    // Check access with optimized query
    const song = await db.song.findUnique({
      where: { id: songId },
      select: {
        id: true,
        userId: true,
        project: {
          select: {
            members: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Only song owner or project admin can delete
    const canDelete = song.userId === userId || (song.project && song.project.members.length > 0);

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify track exists and belongs to song
    const track = await db.songTrack.findUnique({
      where: { id: trackId },
      select: { songId: true, audioPath: true },
    });

    if (!track || track.songId !== songId) {
      return NextResponse.json(
        { error: 'Track not found or does not belong to this song' },
        { status: 404 }
      );
    }

    // Delete audio file from storage if it exists
    let storageDeleted = false;
    if (track.audioPath) {
      storageDeleted = await deleteAudioFromStorage(track.audioPath);

      // Update user's storage usage if file was deleted
      if (storageDeleted) {
        // Get file size from track metadata if available, or estimate
        try {
          const trackData = await db.songTrack.findUnique({
            where: { id: trackId },
            select: { fileSize: true, uploadedById: true },
          });

          if (trackData?.uploadedById && trackData.fileSize) {
            const fileSizeGB = Number(trackData.fileSize) / (1024 * 1024 * 1024);
            await prisma.user.update({
              where: { id: trackData.uploadedById },
              data: {
                storageUsedGB: {
                  decrement: Math.max(0, fileSizeGB),
                },
              },
            });
          }
        } catch (error) {
          console.warn('Failed to update storage usage:', error);
        }
      }
    }

    // Delete track from database
    await db.songTrack.delete({
      where: { id: trackId },
    });

    return NextResponse.json({
      success: true,
      message: 'Track deleted successfully',
      trackId,
      storageDeleted,
    });
  } catch (error) {
    console.error('DELETE /api/songs/[songId]/tracks/[trackId] error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete track',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
