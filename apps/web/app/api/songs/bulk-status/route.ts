import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';

const VALID_STATUSES = ['draft', 'in_progress', 'needs_review', 'complete'];

/**
 * POST /api/songs/bulk-status
 * Update status for multiple songs at once
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Rate limit
    await checkRateLimit(strictLimiter, `songs-bulk:${user.id}`);

    const body = await req.json();
    const { songIds, status } = body;

    // Validate input
    if (!Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json({ error: 'songIds must be a non-empty array' }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Limit batch size
    if (songIds.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 songs per batch' }, { status: 400 });
    }

    // Update all songs (only user's songs)
    const result = await db.song.updateMany({
      where: {
        id: { in: songIds },
        userId: user.id, // Security: only update user's own songs
      },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      status,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/bulk-status', method: 'POST' });
  }
}
