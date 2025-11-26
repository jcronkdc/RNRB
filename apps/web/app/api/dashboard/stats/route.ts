/**
 * Dashboard Stats API
 * Returns real-time statistics for the authenticated user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

// Subscription tier storage limits (in bytes)
const STORAGE_LIMITS: Record<string, number> = {
  free: 1 * 1024 * 1024 * 1024, // 1 GB
  creator: 10 * 1024 * 1024 * 1024, // 10 GB
  studio: 100 * 1024 * 1024 * 1024, // 100 GB
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Run all queries in parallel for speed
    const [
      user,
      projectCount,
      songCount,
      collaboratorCount,
      recentActivityCount,
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
          OR: [
            { org: { memberships: { some: { userId } } } },
            { members: { some: { userId } } },
          ],
        },
      }),

      // Count songs owned by user or where user is collaborator
      prisma.song.count({
        where: {
          OR: [
            { userId },
            { collaborators: { some: { userId } } },
          ],
          archived: false,
        },
      }),

      // Count unique collaborators across all user's songs
      prisma.songCollaborator.count({
        where: {
          song: { userId },
          userId: { not: userId }, // Don't count self
        },
      }),

      // Count recent activity (songs updated in last 7 days)
      prisma.song.count({
        where: {
          OR: [
            { userId },
            { collaborators: { some: { userId } } },
          ],
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate storage
    const tier = user.subscriptionTier || 'free';
    const baseLimit = STORAGE_LIMITS[tier] || STORAGE_LIMITS.free;
    const bonusGB = Number(user.storageBonusGB) || 0;
    const bonusBytes = bonusGB * 1024 * 1024 * 1024;
    const totalStorage = baseLimit + bonusBytes;
    
    const usedGB = Number(user.storageUsedGB) || 0;
    const usedBytes = usedGB * 1024 * 1024 * 1024;

    return NextResponse.json({
      projectCount,
      songCount,
      collaboratorCount,
      recentActivity: recentActivityCount,
      storageUsed: usedBytes,
      storageTotal: totalStorage,
      subscriptionTier: tier,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

