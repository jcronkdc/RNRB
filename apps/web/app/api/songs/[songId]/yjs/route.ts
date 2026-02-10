import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError, AppError } from '@/lib/errors';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { canReadSong, canEditSong } from '@/lib/song-access';

type RouteContext = {
  params: Promise<{ songId: string }>;
};

/**
 * GET /api/songs/[songId]/yjs
 * Retrieve the Yjs document state for a song.
 * Used by late joiners to sync to the current state.
 * Returns the binary Yjs document state as base64.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    await checkRateLimit(standardLimiter, `song-yjs-read:${user.id}`);

    const hasAccess = await canReadSong(songId, user.id);
    if (!hasAccess) {
      throw AppError.forbidden('You do not have access to this song');
    }

    // Look up the EditSession for this song
    const editSession = await db.editSession.findUnique({
      where: {
        entityId_entityType: {
          entityId: songId,
          entityType: 'song',
        },
      },
      select: {
        yjsDocumentState: true,
        yjsStateVector: true,
        version: true,
        lastActivity: true,
        activeUsers: true,
      },
    });

    if (!editSession || !editSession.yjsDocumentState) {
      // No existing Yjs state — the client will initialize a fresh document
      return NextResponse.json({
        hasState: false,
        version: 0,
        activeUsers: [],
      });
    }

    return NextResponse.json({
      hasState: true,
      // Encode binary Yjs state as base64 for JSON transport
      documentState: Buffer.from(editSession.yjsDocumentState).toString('base64'),
      stateVector: editSession.yjsStateVector
        ? Buffer.from(editSession.yjsStateVector).toString('base64')
        : null,
      version: editSession.version,
      lastActivity: editSession.lastActivity,
      activeUsers: editSession.activeUsers,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]/yjs', method: 'GET' });
  }
}

/**
 * POST /api/songs/[songId]/yjs
 * Persist the Yjs document state for a song.
 * Called periodically by the "save authority" client.
 * Accepts base64-encoded binary Yjs state.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { songId } = await params;
    const user = await requireAuth();

    // Allow frequent saves (auto-save fires often)
    await checkRateLimit(standardLimiter, `song-yjs-write:${user.id}`);

    const hasEditAccess = await canEditSong(songId, user.id);
    if (!hasEditAccess) {
      throw AppError.forbidden('You do not have permission to edit this song');
    }

    const body = await req.json();
    const { documentState, stateVector, activeUsers, lyrics, chords, title } = body;

    if (!documentState) {
      throw AppError.badRequest('documentState is required');
    }

    // Decode base64 to Buffer
    const docStateBuffer = Buffer.from(documentState, 'base64');
    const stateVectorBuffer = stateVector ? Buffer.from(stateVector, 'base64') : null;

    // Upsert the EditSession
    await db.editSession.upsert({
      where: {
        entityId_entityType: {
          entityId: songId,
          entityType: 'song',
        },
      },
      create: {
        entityId: songId,
        entityType: 'song',
        yjsDocumentState: docStateBuffer,
        yjsStateVector: stateVectorBuffer,
        activeUsers: activeUsers || [user.id],
        version: 1,
        lastActivity: new Date(),
      },
      update: {
        yjsDocumentState: docStateBuffer,
        yjsStateVector: stateVectorBuffer,
        activeUsers: activeUsers || undefined,
        version: { increment: 1 },
        lastActivity: new Date(),
        editCount: { increment: 1 },
      },
    });

    // Also sync the human-readable fields back to the Song model
    // so the song list, search, and version snapshots have current data
    if (lyrics !== undefined || chords !== undefined || title !== undefined) {
      await db.song.update({
        where: { id: songId },
        data: {
          ...(lyrics !== undefined && { lyrics }),
          ...(chords !== undefined && {
            chords: typeof chords === 'string' ? chords : JSON.stringify(chords),
          }),
          ...(title !== undefined && { title }),
          lastSavedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]/yjs', method: 'POST' });
  }
}
