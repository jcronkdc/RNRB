import { prisma } from '@cronkwaters/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filter = searchParams.get('filter') || 'trending'; // trending, recent, top
  const genre = searchParams.get('genre');
  const mood = searchParams.get('mood');
  const search = searchParams.get('search');
  
  // Parse and validate pagination parameters
  const limitParam = parseInt(searchParams.get('limit') || '20');
  const offsetParam = parseInt(searchParams.get('offset') || '0');
  
  // Validate parsed values are valid positive integers (or zero for offset)
  if (isNaN(limitParam) || limitParam < 1) {
    return NextResponse.json(
      { error: 'Invalid limit parameter: must be a positive integer' },
      { status: 400 }
    );
  }
  
  if (isNaN(offsetParam) || offsetParam < 0) {
    return NextResponse.json(
      { error: 'Invalid offset parameter: must be a non-negative integer' },
      { status: 400 }
    );
  }
  
  const limit = limitParam;
  const offset = offsetParam;

  try {
    const where: any = {};

    if (genre) {
      where.genre = genre;
    }

    if (mood) {
      where.mood = mood;
    }

    if (search) {
      where.song = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    let orderBy: any = {};

    switch (filter) {
      case 'recent':
        orderBy = { publishedAt: 'desc' };
        break;
      case 'top':
        // Order by like count (we'll do a subquery)
        orderBy = { likes: { _count: 'desc' } };
        break;
      case 'trending':
      default:
        // Trending: combination of recent plays and likes
        orderBy = { plays: { _count: 'desc' } };
        break;
    }

    const tracks = await prisma.communityTrack.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        song: {
          select: {
            id: true,
            title: true,
            description: true,
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
    });

    // Check if current user has liked each track
    const session = await auth();
    let tracksWithLikeStatus = tracks;

    if (session?.user?.id) {
      const userLikes = await prisma.trackLike.findMany({
        where: {
          userId: session.user.id,
          communityTrackId: { in: tracks.map((t) => t.id) },
        },
        select: { communityTrackId: true },
      });

      const likedTrackIds = new Set(userLikes.map((like) => like.communityTrackId));

      tracksWithLikeStatus = tracks.map((track) => ({
        ...track,
        isLikedByCurrentUser: likedTrackIds.has(track.id),
      }));
    } else {
      tracksWithLikeStatus = tracks.map((track) => ({
        ...track,
        isLikedByCurrentUser: false,
      }));
    }

    return NextResponse.json({
      tracks: tracksWithLikeStatus,
      pagination: {
        limit,
        offset,
        hasMore: tracks.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching community tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      songId,
      audioUrl,
      audioPath,
      coverUrl,
      waveformData,
      genre,
      mood,
      bpm,
      duration,
      isExplicit,
      allowDownload,
      allowRemix,
    } = body;

    // Validate required fields
    if (!songId || !audioUrl || !audioPath || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: songId, audioUrl, audioPath, duration' },
        { status: 400 }
      );
    }

    // Verify the song exists and belongs to the user
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { userId: true, visibility: true },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    if (song.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only publish your own songs' }, { status: 403 });
    }

    // Check if song is already published to community
    const existing = await prisma.communityTrack.findUnique({
      where: { songId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This song is already published to the community' },
        { status: 400 }
      );
    }

    // Create community track
    const communityTrack = await prisma.communityTrack.create({
      data: {
        songId,
        userId: session.user.id,
        audioUrl,
        audioPath,
        coverUrl,
        waveformData,
        genre,
        mood,
        bpm,
        duration,
        isExplicit: isExplicit || false,
        allowDownload: allowDownload !== false,
        allowRemix: allowRemix !== false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        song: {
          select: {
            id: true,
            title: true,
            description: true,
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
    });

    return NextResponse.json({ track: communityTrack }, { status: 201 });
  } catch (error) {
    console.error('Error publishing track to community:', error);
    return NextResponse.json({ error: 'Failed to publish track' }, { status: 500 });
  }
}

