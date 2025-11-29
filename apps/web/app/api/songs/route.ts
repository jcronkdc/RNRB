import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { standardLimiter, strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/songs
 * Get all standalone songs for the authenticated user (not in projects)
 */
export async function GET() {
  try {
    const user = await requireAuth();

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `songs-read:${user.id}`);

    const songs = await db.song.findMany({
      where: {
        userId: user.id,
        projectId: null, // Standalone songs only
        archived: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        key: true,
        tempo: true,
        timeSignature: true,
        status: true,
        visibility: true,
        lyrics: true,
        chords: true,
        lastSavedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ songs });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs', method: 'GET' });
  }
}

/**
 * POST /api/songs
 * Create a new standalone song
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Rate limit: 10 songs per minute for writes
    await checkRateLimit(strictLimiter, `songs-write:${user.id}`);

    const body = await req.json();
    const {
      title = 'Untitled Song',
      key,
      tempo,
      timeSignature,
      lyrics,
      chords,
      status = 'draft',
      visibility = 'private',
    } = body;

    const song = await db.song.create({
      data: {
        userId: user.id,
        title,
        key,
        tempo: tempo ? parseInt(tempo) : null,
        timeSignature,
        lyrics,
        chords: chords ? JSON.stringify(chords) : null,
        status,
        visibility,
        lastSavedAt: new Date(),
      },
    });

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs', method: 'POST' });
  }
}
