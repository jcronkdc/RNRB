import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@cronkwaters/db';
import { standardLimiter } from '@/lib/rate-limit';

/**
 * GET /api/revenue/stats
 * Get revenue statistics and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const { success } = await standardLimiter.check(identifier);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y, all

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Fetch revenue by source
    const revenueBySource = await db.revenue.groupBy({
      by: ['source'],
      where: {
        userId: session.user.id,
        earnedDate: { gte: startDate },
      },
      _sum: {
        amount: true,
        netAmount: true,
      },
      _count: true,
    });

    // Fetch revenue by month
    const revenues = await db.revenue.findMany({
      where: {
        userId: session.user.id,
        earnedDate: { gte: startDate },
      },
      select: {
        earnedDate: true,
        amount: true,
        netAmount: true,
        source: true,
      },
      orderBy: { earnedDate: 'asc' },
    });

    // Group by month
    const monthlyRevenue = revenues.reduce((acc: any, rev) => {
      const month = rev.earnedDate.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          month,
          total: 0,
          net: 0,
          count: 0,
        };
      }
      acc[month].total += Number(rev.amount);
      acc[month].net += Number(rev.netAmount || 0);
      acc[month].count += 1;
      return acc;
    }, {});

    // Calculate totals
    const totalRevenue = await db.revenue.aggregate({
      where: {
        userId: session.user.id,
        earnedDate: { gte: startDate },
      },
      _sum: {
        amount: true,
        netAmount: true,
      },
      _count: true,
    });

    // Get top songs
    const topSongs = await db.revenue.groupBy({
      by: ['songId'],
      where: {
        userId: session.user.id,
        songId: { not: null },
        earnedDate: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 10,
    });

    // Get song details for top songs
    const topSongsWithDetails = await Promise.all(
      topSongs.map(async (item) => {
        if (!item.songId) return null;
        const song = await db.song.findUnique({
          where: { id: item.songId },
          select: { id: true, title: true },
        });
        return {
          song,
          revenue: item._sum.amount,
          count: item._count,
        };
      })
    );

    return NextResponse.json({
      period,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalNetRevenue: totalRevenue._sum.netAmount || 0,
      totalTransactions: totalRevenue._count,
      revenueBySource: revenueBySource.map((item) => ({
        source: item.source,
        total: item._sum.amount || 0,
        net: item._sum.netAmount || 0,
        count: item._count,
      })),
      monthlyRevenue: Object.values(monthlyRevenue),
      topSongs: topSongsWithDetails.filter(Boolean),
    });
  } catch (error) {
    console.error('[REVENUE] Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
