/**
 * Dashboard Stats API
 * Returns real-time statistics for the authenticated user
 * Including weekly progress and activity streaks
 */

import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkRateLimit, standardLimiter } from '@/lib/rate-limit';

// Subscription tier storage limits (in bytes)
const STORAGE_LIMITS: Record<string, number> = {
  free: 1 * 1024 * 1024 * 1024, // 1 GB
  creator: 10 * 1024 * 1024 * 1024, // 10 GB
  studio: 100 * 1024 * 1024 * 1024, // 100 GB
};

/**
 * Calculate activity streak (consecutive days with activity)
 */
async function calculateStreak(userId: string): Promise<number> {
  // Get all unique dates with activity in the last 60 days
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [songs, messages] = await Promise.all([
    // Songs created or updated
    prisma.song.findMany({
      where: {
        OR: [{ userId }, { collaborators: { some: { userId } } }],
        updatedAt: { gte: sixtyDaysAgo },
      },
      select: { updatedAt: true, createdAt: true },
    }),
    // Chat messages sent
    prisma.chatMessage.findMany({
      where: {
        senderId: userId,
        createdAt: { gte: sixtyDaysAgo },
      },
      select: { createdAt: true },
    }),
  ]);

  // Collect all activity dates
  const activityDates = new Set<string>();

  songs.forEach((song) => {
    activityDates.add(song.updatedAt.toISOString().split('T')[0]);
    activityDates.add(song.createdAt.toISOString().split('T')[0]);
  });

  messages.forEach((msg) => {
    activityDates.add(msg.createdAt.toISOString().split('T')[0]);
  });

  // Calculate streak from today backwards
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    if (activityDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      // Allow skipping today if no activity yet, but break on other gaps
      break;
    }
  }

  return streak;
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate limit: 100 requests per minute per user
    try {
      await checkRateLimit(standardLimiter, `dashboard-stats:${userId}`);
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for speed
    const [
      user,
      projectCount,
      songCount,
      collaboratorCount,
      recentActivityCount,
      thisWeekSongs,
      streak,
      thisWeekMessages,
    ] = await Promise.all([
      // Get user with storage and subscription info
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          storageUsedGB: true,
          storageBonusGB: true,
          subscriptionTier: true,
        },
      }),

      // Count projects where user is owner or member
      prisma.project.count({
        where: {
          OR: [{ org: { memberships: { some: { userId } } } }, { members: { some: { userId } } }],
        },
      }),

      // Count songs owned by user or where user is collaborator
      prisma.song.count({
        where: {
          OR: [{ userId }, { collaborators: { some: { userId } } }],
          archived: false,
        },
      }),

      // Count unique collaborators across all user's songs
      prisma.songCollaborator.count({
        where: {
          song: { userId },
          userId: { not: userId },
        },
      }),

      // Count recent activity (songs updated in last 7 days)
      prisma.song.count({
        where: {
          OR: [{ userId }, { collaborators: { some: { userId } } }],
          updatedAt: { gte: oneWeekAgo },
        },
      }),

      // Count songs created this week
      prisma.song.count({
        where: {
          userId,
          createdAt: { gte: oneWeekAgo },
        },
      }),

      // Calculate activity streak
      calculateStreak(userId),

      // Count chat messages this week (for collaboration hours estimate)
      prisma.chatMessage.count({
        where: {
          senderId: userId,
          createdAt: { gte: oneWeekAgo },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate storage
    const tier = user.subscriptionTier || 'free';
    const baseLimit = STORAGE_LIMITS[tier] || STORAGE_LIMITS.free;
    const bonusGB = Number(user.storageBonusGB) || 0;
    const bonusBytes = bonusGB * 1024 * 1024 * 1024;
    const totalStorage = baseLimit + bonusBytes;

    const usedGB = Number(user.storageUsedGB) || 0;
    const usedBytes = usedGB * 1024 * 1024 * 1024;

    // Estimate hours: ~5 messages per hour of active collaboration
    const thisWeekHours = Math.round(thisWeekMessages / 5);

    return NextResponse.json({
      projectCount,
      songCount,
      collaboratorCount,
      recentActivity: recentActivityCount,
      storageUsed: usedBytes,
      storageTotal: totalStorage,
      subscriptionTier: tier,
      // Weekly stats
      thisWeekSongs,
      thisWeekHours,
      streakDays: streak,
    });
  } catch (error) {
    console.error('[DASHBOARD-STATS] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
