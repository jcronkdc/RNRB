import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * GET /api/library/stats
 * Get library statistics for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Run all queries in parallel for performance
    const [
      totalFiles,
      totalSizeResult,
      favorites,
      recentlyPlayedCount,
      typeDistribution,
      keyDistribution,
    ] = await Promise.all([
      // Total files count
      prisma.libraryFile.count({
        where: { userId },
      }),

      // Total size (sum of all file sizes)
      prisma.libraryFile.aggregate({
        where: { userId },
        _sum: { size: true },
      }),

      // Favorites count
      prisma.libraryFile.count({
        where: { userId, isFavorite: true },
      }),

      // Recently played count (played in last 30 days)
      prisma.libraryFile.count({
        where: {
          userId,
          lastPlayed: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Files by type
      prisma.libraryFile.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true },
      }),

      // Files by musical key (only for files that have a key)
      prisma.libraryFile.groupBy({
        by: ['musicalKey'],
        where: {
          userId,
          musicalKey: { not: null },
        },
        _count: { musicalKey: true },
      }),
    ]);

    // Transform type distribution to object
    const byType: Record<string, number> = {};
    for (const item of typeDistribution) {
      byType[item.type] = item._count.type;
    }

    // Transform key distribution to object
    const byKey: Record<string, number> = {};
    for (const item of keyDistribution) {
      if (item.musicalKey) {
        byKey[item.musicalKey] = item._count.musicalKey;
      }
    }

    return NextResponse.json({
      totalFiles,
      totalSize: Number(totalSizeResult._sum.size || 0),
      favorites,
      recentlyPlayed: recentlyPlayedCount,
      byType,
      byKey,
    });
  } catch (error) {
    console.error('Error fetching library stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
