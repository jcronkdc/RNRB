import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';

/**
 * POST /api/songs/[id]/favorite
 * Toggle favorite status for a song
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Rate limit
    await checkRateLimit(strictLimiter, `song-favorite:${user.id}`);

    const body = await req.json();
    const { isFavorite } = body;

    // Verify ownership
    const song = await db.song.findFirst({
      where: { id, userId: user.id },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    // Update favorite status
    const updated = await db.song.update({
      where: { id },
      data: { isFavorite: Boolean(isFavorite) },
      select: { id: true, isFavorite: true },
    });

    return NextResponse.json({ song: updated });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/[id]/favorite', method: 'POST' });
  }
}
