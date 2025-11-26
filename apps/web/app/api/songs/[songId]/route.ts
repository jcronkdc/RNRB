import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

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

    const song = await db.song.findUnique({
      where: {
        id: songId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!song) {
      throw AppError.notFound('Song');
    }

    // Check access: owner or public song
    if (song.userId !== user.id && song.visibility !== 'public') {
      throw AppError.forbidden('You do not have access to this song');
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

    // Verify ownership
    const existing = await db.song.findUnique({
      where: { id: songId },
      select: { userId: true },
    });

    if (!existing) {
      throw AppError.notFound('Song');
    }

    if (existing.userId !== user.id) {
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

    // Verify ownership
    const existing = await db.song.findUnique({
      where: { id: songId },
      select: { userId: true },
    });

    if (!existing) {
      throw AppError.notFound('Song');
    }

    if (existing.userId !== user.id) {
      throw AppError.forbidden('You do not have permission to delete this song');
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
