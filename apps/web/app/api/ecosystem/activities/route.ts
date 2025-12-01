import { NextRequest, NextResponse } from 'next/server';
import { formatDistanceToNow } from 'date-fns';

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

    // Get user's activity and activities from people they follow
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    const relevantUserIds = [userId, ...followingIds];

    // Fetch activity events
    const activities = await prisma.activityEvent.findMany({
      where: {
        userId: { in: relevantUserIds },
        visibility: { in: ['public', 'followers'] },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        song: {
          select: { id: true, title: true },
        },
        project: {
          select: { id: true, name: true, slug: true },
        },
        show: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    // If no activities, generate some from existing data
    if (activities.length === 0) {
      // Get recent songs as activity placeholders
      const recentSongs = await prisma.song.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, title: true, createdAt: true },
      });

      const recentPractice = await prisma.practiceSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true, startTime: true, durationMinutes: true, focusArea: true },
      });

      const generatedActivities = [
        ...recentSongs.map((song) => ({
          id: `song-${song.id}`,
          type: 'song_created',
          title: `Started working on "${song.title}"`,
          timeAgo: formatDistanceToNow(song.createdAt, { addSuffix: true }),
          celebrationCount: 0,
        })),
        ...recentPractice.map((session) => ({
          id: `practice-${session.id}`,
          type: 'practice_streak',
          title: `Practiced ${session.focusArea || 'music'} for ${session.durationMinutes || 0} minutes`,
          timeAgo: formatDistanceToNow(session.startTime, { addSuffix: true }),
          celebrationCount: 0,
        })),
      ].slice(0, limit);

      return NextResponse.json({
        activities: generatedActivities,
      });
    }

    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timeAgo: formatDistanceToNow(activity.createdAt, { addSuffix: true }),
      celebrationCount: activity.celebrationCount,
      user: activity.user,
      song: activity.song,
      project: activity.project,
      show: activity.show,
    }));

    return NextResponse.json({
      activities: formattedActivities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

// POST - Create a new activity event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, description, visibility, songId, projectId, showId, tourId, metadata } =
      body;

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required' }, { status: 400 });
    }

    const activity = await prisma.activityEvent.create({
      data: {
        userId: session.user.id,
        type,
        title,
        description,
        visibility: visibility || 'public',
        songId,
        projectId,
        showId,
        tourId,
        metadata,
      },
    });

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
