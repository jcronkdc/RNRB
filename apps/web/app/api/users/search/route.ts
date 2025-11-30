import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/users/search
 * Search for users by name, email, or instrument
 * Returns rich user data for Facebook-like search experience
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search users by name, email, or instrument (excluding current user)
    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { musicianProfile: { instruments: { hasSome: [query] } } },
          { musicianProfile: { genres: { hasSome: [query] } } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        musicianProfile: {
          select: {
            instruments: true,
            genres: true,
            location: true,
            availableForCollaboration: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: limit,
      orderBy: [
        { followers: { _count: 'desc' } }, // Prioritize popular users
        { name: 'asc' },
      ],
    });

    // Get following status for current user
    const userIds = users.map((u) => u.id);
    const followStatus = await prisma.userFollow.findMany({
      where: {
        followerId: user.id,
        followingId: { in: userIds },
      },
      select: { followingId: true },
    });
    const followingSet = new Set(followStatus.map((f) => f.followingId));

    // Get mutual connections count
    const currentUserFollowing = await prisma.userFollow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const myFollowingIds = currentUserFollowing.map((f) => f.followingId);

    const mutualConnections = await prisma.userFollow.groupBy({
      by: ['followerId'],
      where: {
        followerId: { in: userIds },
        followingId: { in: myFollowingIds },
      },
      _count: true,
    });
    const mutualMap = new Map(mutualConnections.map((m) => [m.followerId, m._count]));

    // Transform results
    const enrichedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      instruments: u.musicianProfile?.instruments || [],
      genres: u.musicianProfile?.genres || [],
      location: u.musicianProfile?.location || null,
      isAvailable: u.musicianProfile?.availableForCollaboration || false,
      isFollowing: followingSet.has(u.id),
      followerCount: u._count.followers,
      mutualConnections: mutualMap.get(u.id) || 0,
    }));

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    return handleApiError(error, { route: '/api/users/search', method: 'GET' });
  }
}
