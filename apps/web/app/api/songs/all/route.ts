import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/songs/all
 * Get ALL songs for the authenticated user (both standalone and in projects)
 * Includes project information for organization context
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `songs-all:${user.id}`);

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all, standalone, in_project
    const status = searchParams.get('status'); // draft, in_progress, needs_review, complete
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      userId: user.id,
      archived: false,
    };

    // Filter by project status
    if (filter === 'standalone') {
      where.projectId = null;
    } else if (filter === 'in_project') {
      where.projectId = { not: null };
    }

    // Filter by song status
    if (status) {
      where.status = status;
    }

    // Search by title
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Get total count
    const total = await db.song.count({ where });

    // Get songs with project info
    const songs = await db.song.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
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
        tags: true,
        projectId: true,
        lastSavedAt: true,
        createdAt: true,
        updatedAt: true,
        // Include project info if song is in a project
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverImage: true,
          },
        },
      },
    });

    // Get stats
    const [standaloneCount, inProjectCount, draftCount, completeCount] = await Promise.all([
      db.song.count({ where: { userId: user.id, archived: false, projectId: null } }),
      db.song.count({ where: { userId: user.id, archived: false, projectId: { not: null } } }),
      db.song.count({ where: { userId: user.id, archived: false, status: 'draft' } }),
      db.song.count({ where: { userId: user.id, archived: false, status: 'complete' } }),
    ]);

    return NextResponse.json({
      songs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + songs.length < total,
      },
      stats: {
        total: standaloneCount + inProjectCount,
        standalone: standaloneCount,
        inProject: inProjectCount,
        drafts: draftCount,
        complete: completeCount,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/all', method: 'GET' });
  }
}
