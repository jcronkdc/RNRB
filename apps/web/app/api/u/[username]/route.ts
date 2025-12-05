import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    // Validate username
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    console.log('[Public Profile] Looking for username:', username);

    // Step 1: Find the MusicianProfile by username using raw SQL
    // This handles the JSON field query properly
    let profileId: string | null = null;

    try {
      const profiles = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "MusicianProfile" 
        WHERE "socialLinks" IS NOT NULL 
        AND "socialLinks"->>'username' = ${username}
        LIMIT 1
      `;
      profileId = profiles?.[0]?.id || null;
    } catch (queryError) {
      console.error('[Public Profile] Raw query error:', queryError);
      // Continue - profile will be null
    }

    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Step 2: Get full profile with relations
    const musicianProfile = await prisma.musicianProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            createdAt: true,
            profileCompleted: true,
            communityTracks: {
              include: {
                song: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    artworkUrl: true,
                  },
                },
                _count: {
                  select: {
                    likes: true,
                    plays: true,
                    comments: true,
                  },
                },
              },
              orderBy: { publishedAt: 'desc' },
              take: 12,
            },
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        },
        featuredSong: {
          select: {
            id: true,
            title: true,
            artworkUrl: true,
            audioUrl: true,
          },
        },
        featuredProject: {
          select: {
            id: true,
            name: true,
            coverImage: true,
          },
        },
      },
    });

    console.log('[Public Profile] Found profile:', musicianProfile ? 'yes' : 'no');

    if (!musicianProfile) {
      // Profile not found by username in socialLinks
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!musicianProfile.user) {
      // Profile exists but user data is missing (shouldn't happen)
      console.error('[Public Profile] Profile found but user is null');
      return NextResponse.json({ error: 'Profile data incomplete' }, { status: 404 });
    }

    const user = musicianProfile.user;
    const socialLinksData = (musicianProfile.socialLinks as Record<string, unknown>) || {};

    // Check if current user follows this user
    const session = await auth();
    let isFollowing = false;
    let isOwnProfile = false;

    if (session?.user?.id) {
      isOwnProfile = session.user.id === user.id;
      if (!isOwnProfile) {
        const follow = await prisma.userFollow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
        });
        isFollowing = !!follow;
      }
    }

    // Get upcoming shows for this user through their organizations
    // Shows are associated with orgs, not directly with users
    const userOrgs = await prisma.membership.findMany({
      where: { userId: user.id },
      select: { orgId: true },
    });

    const orgIds = userOrgs.map((org: { orgId: string }) => org.orgId);

    const upcomingShows =
      orgIds.length > 0
        ? await prisma.show.findMany({
            where: {
              orgId: { in: orgIds },
              date: { gte: new Date() },
              status: 'scheduled',
            },
            include: {
              venue: {
                select: {
                  name: true,
                  city: true,
                  state: true,
                },
              },
            },
            orderBy: { date: 'asc' },
            take: 5,
          })
        : [];

    return NextResponse.json({
      profile: {
        // User basics
        id: user.id,
        displayName: user.name || socialLinksData.stageName || username,
        username: username,
        bio: socialLinksData.bio || null,
        profilePicture: user.image || null,
        stageName: socialLinksData.stageName || null,
        location: musicianProfile.location || null,
        recordLabel: socialLinksData.recordLabel || null,
        yearsExperience: socialLinksData.yearsExperience || null,
        joinedAt: user.createdAt,

        // Musical identity
        instruments: musicianProfile.instruments || [],
        genres: musicianProfile.genres || [],
        skills: musicianProfile.skills || [],

        // Status & availability
        currentStatus: musicianProfile.currentStatus,
        statusMessage: musicianProfile.statusMessage,
        lookingFor: musicianProfile.lookingFor || [],
        availableForCollaboration: musicianProfile.availableForCollaboration,
        availableForGigs: musicianProfile.availableForGigs,
        openToOpportunities: musicianProfile.openToOpportunities,

        // Stats
        stats: {
          followers: user._count.followers,
          following: user._count.following,
          tracks: user.communityTracks.length,
          totalPracticeMinutes: musicianProfile.totalPracticeMinutes,
          currentStreak: musicianProfile.currentStreak,
          longestStreak: musicianProfile.longestStreak,
          completedSongs: musicianProfile.completedSongs,
          completedProjects: musicianProfile.completedProjects,
          collaborationsCount: musicianProfile.collaborationsCount,
          showsPlayed: musicianProfile.showsPlayed,
        },

        // Social links (only public ones)
        socialLinks: {
          // Music platforms
          spotify: socialLinksData.spotify || null,
          appleMusic: socialLinksData.appleMusic || null,
          soundcloud: socialLinksData.soundcloud || null,
          bandcamp: socialLinksData.bandcamp || null,
          audiomack: socialLinksData.audiomack || null,
          tidal: socialLinksData.tidal || null,
          deezer: socialLinksData.deezer || null,
          amazonMusic: socialLinksData.amazonMusic || null,
          // Video
          youtube: socialLinksData.youtube || null,
          vimeo: socialLinksData.vimeo || null,
          twitch: socialLinksData.twitch || null,
          // Social
          instagram: socialLinksData.instagram || null,
          twitter: socialLinksData.twitter || null,
          facebook: socialLinksData.facebook || null,
          tiktok: socialLinksData.tiktok || null,
          threads: socialLinksData.threads || null,
          bluesky: socialLinksData.bluesky || null,
          mastodon: socialLinksData.mastodon || null,
          linkedin: socialLinksData.linkedin || null,
          // Community
          discord: socialLinksData.discord || null,
          telegram: socialLinksData.telegram || null,
          // Live music
          songkick: socialLinksData.songkick || null,
          bandsintown: socialLinksData.bandsintown || null,
          genius: socialLinksData.genius || null,
          // Support
          patreon: socialLinksData.patreon || null,
          kofi: socialLinksData.kofi || null,
          buyMeACoffee: socialLinksData.buyMeACoffee || null,
          // Link aggregators
          linktree: socialLinksData.linktree || null,
        },

        // Websites
        websites: socialLinksData.websites || [],

        // Contact (only if public or booking related)
        bookingEmail: socialLinksData.bookingEmail || null,
        pressEmail: socialLinksData.pressEmail || null,
        management: socialLinksData.management || null,

        // Featured content
        featuredSong: musicianProfile.featuredSong,
        featuredProject: musicianProfile.featuredProject
          ? {
              id: musicianProfile.featuredProject.id,
              title: musicianProfile.featuredProject.name,
              coverImage: musicianProfile.featuredProject.coverImage,
            }
          : null,

        // Tracks
        tracks: user.communityTracks.map((track) => ({
          id: track.id,
          songId: track.songId,
          title: track.song.title,
          description: track.song.description,
          artworkUrl: track.song.artworkUrl || track.coverUrl,
          audioUrl: track.audioUrl,
          genre: track.genre,
          mood: track.mood,
          bpm: track.bpm,
          duration: track.duration,
          allowDownload: track.allowDownload,
          allowRemix: track.allowRemix,
          publishedAt: track.publishedAt,
          likes: track._count.likes,
          plays: track._count.plays,
          comments: track._count.comments,
        })),

        // Upcoming shows
        upcomingShows: upcomingShows.map((show) => ({
          id: show.id,
          date: show.date,
          venue: show.venue?.name,
          city: show.venue?.city,
          state: show.venue?.state,
          ticketUrl: show.ticketUrl,
        })),

        // Relationship to current user
        isFollowing,
        isOwnProfile,
      },
    });
  } catch (error) {
    console.error('[Public Profile] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
