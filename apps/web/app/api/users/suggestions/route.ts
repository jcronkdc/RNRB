import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';

/**
 * GET /api/users/suggestions
 * Get "People You May Know" suggestions based on:
 * - Similar genres/instruments
 * - Mutual connections
 * - Recently active users
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    // Get current user's profile for matching
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        musicianProfile: true,
        following: {
          select: { followingId: true },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ suggestions: [] });
    }

    // Get IDs of users we're already following
    const followingIds = new Set(currentUser.following.map((f) => f.followingId));
    followingIds.add(user.id); // Exclude ourselves

    // Get our genres and instruments for matching
    const userGenres = currentUser.musicianProfile?.genres || [];
    const userInstruments = currentUser.musicianProfile?.instruments || [];

    // Find users with similar interests
    const suggestions: Array<{
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      reason: string;
      score: number;
      instruments?: string[];
      genres?: string[];
      location?: string;
      isAvailable?: boolean;
      mutualConnections?: number;
    }> = [];

    const excludeIds = Array.from(followingIds);

    // Query 1: Users with similar genres
    if (userGenres.length > 0) {
      const genreMatches = await prisma.user.findMany({
        where: {
          id: { notIn: excludeIds },
          musicianProfile: {
            genres: { hasSome: userGenres },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          musicianProfile: {
            select: {
              genres: true,
              instruments: true,
              location: true,
              availableForCollaboration: true,
            },
          },
        },
        take: limit * 2,
      });

      for (const u of genreMatches) {
        const matchingGenres =
          u.musicianProfile?.genres?.filter((g) => userGenres.includes(g)) || [];
        if (matchingGenres.length > 0) {
          suggestions.push({
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image,
            reason: `Also into ${matchingGenres.slice(0, 2).join(' and ')}`,
            score: matchingGenres.length * 10,
            genres: u.musicianProfile?.genres || [],
            instruments: u.musicianProfile?.instruments || [],
            location: u.musicianProfile?.location || undefined,
            isAvailable: u.musicianProfile?.availableForCollaboration || false,
          });
        }
      }
    }

    // Query 2: Users with similar instruments
    if (userInstruments.length > 0) {
      const instrumentMatches = await prisma.user.findMany({
        where: {
          id: { notIn: excludeIds },
          musicianProfile: {
            instruments: { hasSome: userInstruments },
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          musicianProfile: {
            select: {
              genres: true,
              instruments: true,
              location: true,
              availableForCollaboration: true,
            },
          },
        },
        take: limit * 2,
      });

      for (const u of instrumentMatches) {
        const matchingInstruments =
          u.musicianProfile?.instruments?.filter((i) => userInstruments.includes(i)) || [];
        if (matchingInstruments.length > 0) {
          const existing = suggestions.find((s) => s.id === u.id);
          if (existing) {
            existing.score += matchingInstruments.length * 8;
          } else {
            suggestions.push({
              id: u.id,
              name: u.name,
              email: u.email,
              image: u.image,
              reason: `Plays ${matchingInstruments.slice(0, 2).join(' and ')}`,
              score: matchingInstruments.length * 8,
              genres: u.musicianProfile?.genres || [],
              instruments: u.musicianProfile?.instruments || [],
              location: u.musicianProfile?.location || undefined,
              isAvailable: u.musicianProfile?.availableForCollaboration || false,
            });
          }
        }
      }
    }

    // Query 3: Users followed by people you follow (mutual connections)
    if (excludeIds.length > 1) {
      const mutualConnections = await prisma.userFollow.findMany({
        where: {
          followerId: { in: excludeIds.filter((id) => id !== user.id) },
          followingId: { notIn: excludeIds },
        },
        select: {
          followingId: true,
          following: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              musicianProfile: {
                select: {
                  genres: true,
                  instruments: true,
                  location: true,
                  availableForCollaboration: true,
                },
              },
            },
          },
        },
      });

      // Count mutual connections per user
      const mutualCounts = new Map<string, number>();
      for (const mc of mutualConnections) {
        mutualCounts.set(mc.followingId, (mutualCounts.get(mc.followingId) || 0) + 1);
      }

      // Add users with mutual connections
      const addedFromMutual = new Set<string>();
      for (const mc of mutualConnections) {
        if (addedFromMutual.has(mc.followingId)) continue;
        addedFromMutual.add(mc.followingId);

        const mutualCount = mutualCounts.get(mc.followingId) || 1;
        const existing = suggestions.find((s) => s.id === mc.followingId);
        if (existing) {
          existing.score += mutualCount * 15;
          existing.mutualConnections = mutualCount;
          if (mutualCount >= 2) {
            existing.reason = `${mutualCount} mutual connections`;
          }
        } else {
          suggestions.push({
            id: mc.following.id,
            name: mc.following.name,
            email: mc.following.email,
            image: mc.following.image,
            reason: mutualCount > 1 ? `${mutualCount} mutual connections` : '1 mutual connection',
            score: mutualCount * 15,
            mutualConnections: mutualCount,
            genres: mc.following.musicianProfile?.genres || [],
            instruments: mc.following.musicianProfile?.instruments || [],
            location: mc.following.musicianProfile?.location || undefined,
            isAvailable: mc.following.musicianProfile?.availableForCollaboration || false,
          });
        }
      }
    }

    // Query 4: Recently active users available for collaboration
    const activeUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        musicianProfile: {
          availableForCollaboration: true,
        },
        authoredPosts: {
          some: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        musicianProfile: {
          select: {
            genres: true,
            instruments: true,
            location: true,
            availableForCollaboration: true,
          },
        },
      },
      take: limit,
      orderBy: {
        authoredPosts: {
          _count: 'desc',
        },
      },
    });

    for (const u of activeUsers) {
      const existing = suggestions.find((s) => s.id === u.id);
      if (existing) {
        existing.score += 5;
        existing.isAvailable = true;
      } else {
        suggestions.push({
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image,
          reason: 'Available for collaboration',
          score: 5,
          genres: u.musicianProfile?.genres || [],
          instruments: u.musicianProfile?.instruments || [],
          location: u.musicianProfile?.location || undefined,
          isAvailable: true,
        });
      }
    }

    // Sort by score and limit
    const sortedSuggestions = suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...rest }) => rest);

    return NextResponse.json({ suggestions: sortedSuggestions });
  } catch (error) {
    return handleApiError(error, { route: '/api/users/suggestions', method: 'GET' });
  }
}
