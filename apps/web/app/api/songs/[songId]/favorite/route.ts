import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';

/**
 * POST /api/songs/[songId]/favorite
 * Toggle favorite status for a song
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ songId: string }> }) {
  try {
    const user = await requireAuth();
    const { songId } = await params;

    // Rate limit
    await checkRateLimit(strictLimiter, `song-favorite:${user.id}`);

    const body = await req.json();
    const { isFavorite } = body;

    // Verify ownership
    const song = await db.song.findFirst({
      where: { id: songId, userId: user.id },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Update favorite status
    const updated = await db.song.update({
      where: { id: songId },
      data: { isFavorite: Boolean(isFavorite) },
      select: { id: true, isFavorite: true },
    });

    return NextResponse.json({ song: updated });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[songId]/favorite', method: 'POST' });
  }
}
