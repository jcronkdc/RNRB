import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError, AppError } from '@/lib/errors';
import { standardLimiter, strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { canReadSong, isSongOwner } from '@/lib/song-access';

type RouteContext = {
  params: Promise<{ songId: string }>;
};

/**
 * GET /api/songs/[songId]/collaborators
 * List all collaborators on a song
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    await checkRateLimit(standardLimiter, `song-collabs-read:${user.id}`);

    const hasAccess = await canReadSong(songId, user.id);
    if (!hasAccess) {
      throw AppError.forbidden('You do not have access to this song');
    }

    const collaborators = await db.songCollaborator.findMany({
      where: { songId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { invitedAt: 'asc' },
    });

    // Also include the song owner
    const song = await db.song.findUnique({
      where: { id: songId },
      select: {
        userId: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({
      owner: song?.user || null,
      collaborators: collaborators.map((c) => ({
        id: c.id,
        userId: c.userId,
        email: c.email,
        role: c.role,
        invitedAt: c.invitedAt,
        acceptedAt: c.acceptedAt,
        user: c.user,
      })),
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]/collaborators', method: 'GET' });
  }
}

/**
 * POST /api/songs/[songId]/collaborators
 * Invite a collaborator to a song (by email or userId)
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    await checkRateLimit(strictLimiter, `song-collabs-write:${user.id}`);

    // Only the owner can invite collaborators
    const isOwner = await isSongOwner(songId, user.id);
    if (!isOwner) {
      throw AppError.forbidden('Only the song owner can invite collaborators');
    }

    const body = await req.json();
    const { email, userId: inviteUserId, role = 'co-writer' } = body;

    if (!email && !inviteUserId) {
      throw AppError.badRequest('Either email or userId is required');
    }

    // Check if already invited
    const existing = await db.songCollaborator.findFirst({
      where: {
        songId,
        OR: [
          ...(email ? [{ email }] : []),
          ...(inviteUserId ? [{ userId: inviteUserId }] : []),
        ],
      },
    });

    if (existing) {
      throw AppError.badRequest('This person has already been invited');
    }

    // If inviting by email, check if there's a registered user with that email
    let resolvedUserId = inviteUserId;
    if (email && !resolvedUserId) {
      const existingUser = await db.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingUser) {
        resolvedUserId = existingUser.id;
      }
    }

    // Don't let someone invite themselves
    if (resolvedUserId === user.id) {
      throw AppError.badRequest('You cannot invite yourself');
    }

    const collaborator = await db.songCollaborator.create({
      data: {
        songId,
        userId: resolvedUserId || null,
        email: email || null,
        role,
        // If inviting a registered user, auto-accept for now
        // (in future, this could require explicit acceptance)
        acceptedAt: resolvedUserId ? new Date() : null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ collaborator }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]/collaborators', method: 'POST' });
  }
}

/**
 * DELETE /api/songs/[songId]/collaborators
 * Remove a collaborator from a song (by collaborator ID in query params)
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    await checkRateLimit(strictLimiter, `song-collabs-delete:${user.id}`);

    const { searchParams } = new URL(req.url);
    const collaboratorId = searchParams.get('collaboratorId');

    if (!collaboratorId) {
      throw AppError.badRequest('collaboratorId query parameter is required');
    }

    // Owner can remove anyone; collaborators can remove themselves
    const collab = await db.songCollaborator.findUnique({
      where: { id: collaboratorId },
      select: { songId: true, userId: true },
    });

    if (!collab || collab.songId !== songId) {
      throw AppError.notFound('Collaborator');
    }

    const isOwner = await isSongOwner(songId, user.id);
    const isSelf = collab.userId === user.id;

    if (!isOwner && !isSelf) {
      throw AppError.forbidden('You can only remove yourself or be the song owner');
    }

    await db.songCollaborator.delete({
      where: { id: collaboratorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]/collaborators', method: 'DELETE' });
  }
}
