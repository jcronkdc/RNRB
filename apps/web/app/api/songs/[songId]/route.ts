import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError, AppError } from '@/lib/errors';
import { standardLimiter, strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { canReadSong, canEditSong, isSongOwner } from '@/lib/song-access';

type RouteContext = {
  params: Promise<{
    songId: string;
  }>;
};

/**
 * GET /api/songs/[songId]
 * Get a specific song by ID
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `song-read:${user.id}`);

    // Check access: owner, collaborator, project member, or public
    const hasAccess = await canReadSong(songId, user.id);
    if (!hasAccess) {
      throw AppError.forbidden('You do not have access to this song');
    }

    const song = await db.song.findUnique({
      where: { id: songId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!song) {
      throw AppError.notFound('Song');
    }

    return NextResponse.json({ song });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]', method: 'GET' });
  }
}

/**
 * PATCH /api/songs/[songId]
 * Update a song (auto-save)
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    // Rate limit: 60 updates per minute (allows fast auto-save)
    await checkRateLimit(standardLimiter, `song-update:${user.id}`);

    // Check edit access: owner, collaborator, or project member
    const hasEditAccess = await canEditSong(songId, user.id);
    if (!hasEditAccess) {
      throw AppError.forbidden('You do not have permission to edit this song');
    }

    const body = await req.json();
    const {
      title,
      key,
      tempo,
      timeSignature,
      lyrics,
      chords,
      status,
      visibility,
      copyrightInfo,
      audioUrl,
      audioPath,
      // AI Album Art fields
      artworkUrl,
      artworkPrompt,
      artworkStyle,
    } = body;

    const song = await db.song.update({
      where: { id: songId },
      data: {
        ...(title !== undefined && { title }),
        ...(key !== undefined && { key }),
        ...(tempo !== undefined && { tempo: tempo ? parseInt(tempo) : null }),
        ...(timeSignature !== undefined && { timeSignature }),
        ...(lyrics !== undefined && { lyrics }),
        ...(chords !== undefined && {
          chords: typeof chords === 'string' ? chords : JSON.stringify(chords),
        }),
        ...(status !== undefined && { status }),
        ...(visibility !== undefined && { visibility }),
        ...(copyrightInfo !== undefined && { copyrightInfo }),
        ...(audioUrl !== undefined && { audioUrl }),
        ...(audioPath !== undefined && { audioPath }),
        // AI Album Art fields
        ...(artworkUrl !== undefined && { artworkUrl }),
        ...(artworkPrompt !== undefined && { artworkPrompt }),
        ...(artworkStyle !== undefined && { artworkStyle }),
        lastSavedAt: new Date(),
      },
    });

    return NextResponse.json({ song });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]', method: 'PATCH' });
  }
}

/**
 * DELETE /api/songs/[songId]
 * Delete a song (soft delete by archiving)
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    // Rate limit: 10 deletes per minute
    await checkRateLimit(strictLimiter, `song-delete:${user.id}`);

    // Only the owner can delete a song
    const isOwner = await isSongOwner(songId, user.id);
    if (!isOwner) {
      throw AppError.forbidden('Only the song owner can delete this song');
    }

    // Soft delete by archiving
    await db.song.update({
      where: { id: songId },
      data: { archived: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]', method: 'DELETE' });
  }
}
