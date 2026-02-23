import type { Prisma } from '@cronkwaters/db';
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
    const favorites = searchParams.get('favorites'); // true to filter favorites only
    const status = searchParams.get('status'); // draft, in_progress, needs_review, complete
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Prisma.SongWhereInput = {
      userId: user.id,
      archived: false,
    };

    // Filter by favorites
    if (favorites === 'true') {
      where.isFavorite = true;
    }

    // Filter by project status
    if (filter === 'standalone') {
      where.projectId = null;
    } else if (filter === 'in_project') {
      where.projectId = { not: null };
    }

    // Filter by song status
    if (
      status &&
      ['draft', 'in_progress', 'needs_review', 'complete', 'published', 'archived'].includes(status)
    ) {
      where.status = status as Prisma.EnumSongStatusFilter;
    }

    // Search by title
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    // Get total count
    let total = 0;
    let songs: any[] = [];
    let stats = {
      total: 0,
      standalone: 0,
      inProject: 0,
      drafts: 0,
      complete: 0,
      favorites: 0,
    };

    try {
      total = await db.song.count({ where });

      // Get songs with project info
      songs = await db.song.findMany({
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
          isFavorite: true,
          lastSavedAt: true,
          createdAt: true,
          updatedAt: true,
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
      const [standaloneCount, inProjectCount, draftCount, completeCount, favoritesCount] =
        await Promise.all([
          db.song.count({ where: { userId: user.id, archived: false, projectId: null } }),
          db.song.count({ where: { userId: user.id, archived: false, projectId: { not: null } } }),
          db.song.count({ where: { userId: user.id, archived: false, status: 'draft' } }),
          db.song.count({ where: { userId: user.id, archived: false, status: 'complete' } }),
          db.song.count({ where: { userId: user.id, archived: false, isFavorite: true } }),
        ]);

      stats = {
        total: standaloneCount + inProjectCount,
        standalone: standaloneCount,
        inProject: inProjectCount,
        drafts: draftCount,
        complete: completeCount,
        favorites: favoritesCount,
      };
    } catch (dbError) {
      console.error('[Songs API] Database error:', dbError);
      // Return empty results if there's a database error (e.g., table doesn't exist)
      return NextResponse.json({
        songs: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
        stats: {
          total: 0,
          standalone: 0,
          inProject: 0,
          drafts: 0,
          complete: 0,
          favorites: 0,
        },
      });
    }

    return NextResponse.json({
      songs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + songs.length < total,
      },
      stats,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/songs/all', method: 'GET' });
  }
}
