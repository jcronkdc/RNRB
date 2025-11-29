import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

// GET /api/sites/sync-data - Fetch user's data for syncing to website
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type') as
      | 'songs'
      | 'shows'
      | 'members'
      | 'awards'
      | 'releases';

    if (!dataType) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    let items: unknown[] = [];

    switch (dataType) {
      case 'songs': {
        // Fetch user's songs with audio
        const songs = await prisma.song.findMany({
          where: {
            OR: [
              // Songs directly owned by user
              { userId },
              // Songs in projects user has access to
              {
                project: {
                  org: {
                    memberships: {
                      some: { userId },
                    },
                  },
                },
              },
            ],
            archived: false,
          },
          include: {
            project: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });

        items = songs.map((song) => ({
          type: 'song' as const,
          data: {
            id: song.id,
            title: song.title,
            artist: song.writer || 'Unknown Artist',
            audioUrl: song.audioUrl,
            coverUrl: song.artworkUrl,
            duration: song.tempo ? song.tempo * 3 : 180, // Estimate from tempo, default 3 min
            createdAt: song.createdAt,
            projectName: song.project?.name,
          },
        }));
        break;
      }

      case 'shows': {
        // Fetch upcoming and recent shows
        const shows = await prisma.show.findMany({
          where: {
            org: {
              memberships: {
                some: { userId },
              },
            },
          },
          include: {
            venue: true,
            tour: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { date: 'desc' },
          take: 100,
        });

        items = shows.map((show) => ({
          type: 'show' as const,
          data: {
            id: show.id,
            name: show.name,
            date: show.date,
            venue: show.venue
              ? {
                  name: show.venue.name,
                  city: show.venue.city,
                  state: show.venue.state,
                  country: show.venue.country,
                }
              : null,
            ticketUrl: show.ticketUrl,
            status: show.status as 'scheduled' | 'soldout' | 'cancelled' | undefined,
            tourName: show.tour?.name,
          },
        }));
        break;
      }

      case 'members': {
        // Fetch band members from user's orgs
        const memberships = await prisma.membership.findMany({
          where: { userId },
          include: {
            org: {
              include: {
                bandMembers: true,
              },
            },
          },
        });

        const allMembers = memberships.flatMap((m) => m.org.bandMembers || []);

        // Dedupe by id
        const uniqueMembers = Array.from(new Map(allMembers.map((m) => [m.id, m])).values());

        items = uniqueMembers.map((member) => ({
          type: 'member' as const,
          data: {
            id: member.id,
            name: member.name,
            role: member.role,
            image: member.image,
            instruments: member.instruments as string[] | undefined,
          },
        }));
        break;
      }

      case 'awards': {
        // Fetch awards from user's orgs
        const memberships = await prisma.membership.findMany({
          where: { userId },
          include: {
            org: {
              include: {
                awards: true,
              },
            },
          },
        });

        const allAwards = memberships.flatMap((m) => m.org.awards || []);

        // Dedupe by id
        const uniqueAwards = Array.from(new Map(allAwards.map((a) => [a.id, a])).values());

        items = uniqueAwards.map((award) => ({
          type: 'award' as const,
          data: {
            id: award.id,
            name: award.name,
            organization: award.organization,
            year: award.year,
            image: award.image,
          },
        }));
        break;
      }

      case 'releases': {
        // Fetch releases/albums from community tracks
        const tracks = await prisma.communityTrack.findMany({
          where: { userId },
          include: {
            song: true,
          },
          orderBy: { publishedAt: 'desc' },
          take: 50,
        });

        // Group by album if available, otherwise treat as singles
        const releases = tracks.map((track) => ({
          type: 'release' as const,
          data: {
            id: track.id,
            title: track.song?.title || 'Untitled',
            type: 'single' as const,
            releaseDate: track.publishedAt || new Date(),
            coverUrl: track.song?.artworkUrl,
            trackCount: 1,
          },
        }));

        items = releases;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json({ items, count: items.length });
  } catch (error) {
    console.error('[SYNC-DATA] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sync data' }, { status: 500 });
  }
}

// POST /api/sites/sync-data - Refresh synced data for specific items
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { type, ids } = body as { type: string; ids: string[] };

    if (!type || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Missing type or ids' }, { status: 400 });
    }

    let refreshedItems: unknown[] = [];

    switch (type) {
      case 'songs': {
        const songs = await prisma.song.findMany({
          where: {
            id: { in: ids },
            OR: [
              { userId },
              {
                project: {
                  org: {
                    memberships: {
                      some: { userId },
                    },
                  },
                },
              },
            ],
          },
          include: {
            project: {
              select: { name: true },
            },
          },
        });

        refreshedItems = songs.map((song) => ({
          id: song.id,
          title: song.title,
          artist: song.writer || 'Unknown Artist',
          audioUrl: song.audioUrl,
          coverUrl: song.artworkUrl,
          duration: song.tempo ? song.tempo * 3 : 180,
        }));
        break;
      }

      case 'shows': {
        const shows = await prisma.show.findMany({
          where: {
            id: { in: ids },
            org: {
              memberships: {
                some: { userId },
              },
            },
          },
          include: {
            venue: true,
          },
        });

        refreshedItems = shows.map((show) => ({
          id: show.id,
          name: show.name,
          date: show.date,
          venue: show.venue
            ? {
                name: show.venue.name,
                city: show.venue.city,
                state: show.venue.state,
                country: show.venue.country,
              }
            : null,
          ticketUrl: show.ticketUrl,
          status: show.status,
        }));
        break;
      }

      case 'members': {
        const members = await prisma.bandMember.findMany({
          where: {
            id: { in: ids },
            org: {
              memberships: {
                some: { userId },
              },
            },
          },
        });

        refreshedItems = members.map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role,
          image: member.image,
          instruments: member.instruments,
        }));
        break;
      }

      case 'awards': {
        const awards = await prisma.award.findMany({
          where: {
            id: { in: ids },
            org: {
              memberships: {
                some: { userId },
              },
            },
          },
        });

        refreshedItems = awards.map((award) => ({
          id: award.id,
          name: award.name,
          organization: award.organization,
          year: award.year,
          image: award.image,
        }));
        break;
      }
    }

    return NextResponse.json({
      items: refreshedItems,
      count: refreshedItems.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[SYNC-DATA] Refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh sync data' }, { status: 500 });
  }
}
