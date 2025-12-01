import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from '@/lib/auth';
import { prisma } from '@cronkwaters/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const userId = session.user.id;

    // Get user's profile for matching
    const userProfile = await prisma.musicianProfile.findUnique({
      where: { userId },
      select: {
        instruments: true,
        genres: true,
        skills: true,
        location: true,
        lookingFor: true,
      },
    });

    // Get users the current user already follows
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = new Set(following.map((f) => f.followingId));

    // Find musicians to suggest - prioritize:
    // 1. Those with matching genres/instruments
    // 2. Those who are available for collaboration
    // 3. Those who are looking for what the user offers

    const suggestions = await prisma.user.findMany({
      where: {
        id: { not: userId },
        musicianProfile: {
          availableForCollaboration: true,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        musicianProfile: {
          select: {
            instruments: true,
            genres: true,
            skills: true,
            currentStatus: true,
            statusMessage: true,
            lookingFor: true,
            location: true,
            availableForCollaboration: true,
            availableForGigs: true,
          },
        },
        _count: {
          select: {
            followers: true,
            songs: true,
          },
        },
      },
      take: limit * 3, // Get more than needed for filtering
    });

    // Score and sort suggestions
    const scoredSuggestions = suggestions
      .filter((s) => !followingIds.has(s.id)) // Exclude already following
      .map((s) => {
        let score = 0;
        const profile = s.musicianProfile;

        if (profile && userProfile) {
          // Genre overlap
          const genreOverlap = profile.genres.filter((g) => userProfile.genres.includes(g)).length;
          score += genreOverlap * 10;

          // Looking for what user offers
          if (profile.lookingFor && userProfile.instruments) {
            const matchingNeeds = profile.lookingFor.filter((need) =>
              userProfile.instruments.some((inst) =>
                inst.toLowerCase().includes(need.toLowerCase())
              )
            ).length;
            score += matchingNeeds * 15;
          }

          // User is looking for what they offer
          if (userProfile.lookingFor && profile.instruments) {
            const matchingOffers = userProfile.lookingFor.filter((need) =>
              profile.instruments.some((inst) => inst.toLowerCase().includes(need.toLowerCase()))
            ).length;
            score += matchingOffers * 15;
          }

          // Same location bonus
          if (profile.location && userProfile.location) {
            if (profile.location.toLowerCase() === userProfile.location.toLowerCase()) {
              score += 5;
            }
          }
        }

        // Activity bonus
        score += Math.min(s._count.songs * 2, 10);
        score += Math.min(s._count.followers, 10);

        return { ...s, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Format for frontend
    const formattedMusicians = scoredSuggestions.map((s) => ({
      id: s.id,
      name: s.name,
      image: s.image,
      instruments: s.musicianProfile?.instruments || [],
      genres: s.musicianProfile?.genres || [],
      currentStatus: s.musicianProfile?.currentStatus,
      statusMessage: s.musicianProfile?.statusMessage,
      lookingFor: s.musicianProfile?.lookingFor || [],
      location: s.musicianProfile?.location,
      songCount: s._count.songs,
      followerCount: s._count.followers,
    }));

    return NextResponse.json({
      musicians: formattedMusicians,
    });
  } catch (error) {
    console.error('Error fetching suggested musicians:', error);
    return NextResponse.json({ error: 'Failed to fetch suggested musicians' }, { status: 500 });
  }
}
