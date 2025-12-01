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
    const needType = searchParams.get('needType');

    // Get user's profile for matching
    const profile = await prisma.musicianProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        instruments: true,
        genres: true,
        skills: true,
      },
    });

    // Build filter - exclude user's own needs
    const where: any = {
      status: 'open',
      visibility: 'public',
      userId: { not: session.user.id },
    };

    if (needType) {
      where.needType = needType;
    }

    // If user has a profile, prioritize matching needs
    // For now, just fetch all open needs
    const needs = await prisma.collaborationNeed.findMany({
      where,
      orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        song: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Format for frontend
    const formattedNeeds = needs.map((need) => ({
      id: need.id,
      needType: need.needType,
      title: need.title,
      description: need.description,
      instruments: need.instruments,
      genres: need.genres,
      skills: need.skills,
      isPaid: need.isPaid,
      budget: Number(need.budget) || null,
      compensation: need.compensation,
      isRemote: need.isRemote,
      location: need.location,
      urgency: need.urgency,
      user: need.user,
      project: need.project,
      song: need.song,
    }));

    return NextResponse.json({
      needs: formattedNeeds,
    });
  } catch (error) {
    console.error('Error fetching collaboration needs:', error);
    return NextResponse.json({ error: 'Failed to fetch collaboration needs' }, { status: 500 });
  }
}

// POST - Create a new collaboration need
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      needType,
      title,
      description,
      instruments,
      genres,
      skills,
      isPaid,
      budget,
      compensation,
      isRemote,
      location,
      urgency,
      projectId,
      songId,
      visibility,
    } = body;

    if (!needType || !title) {
      return NextResponse.json({ error: 'Need type and title are required' }, { status: 400 });
    }

    const need = await prisma.collaborationNeed.create({
      data: {
        userId: session.user.id,
        needType,
        title,
        description,
        instruments: instruments || [],
        genres: genres || [],
        skills: skills || [],
        isPaid: isPaid ?? false,
        budget: budget ? parseFloat(budget) : null,
        compensation,
        isRemote: isRemote ?? true,
        location,
        urgency: urgency || 'normal',
        projectId,
        songId,
        visibility: visibility || 'public',
      },
    });

    // Create activity event
    await prisma.activityEvent.create({
      data: {
        userId: session.user.id,
        type: 'collaboration_need_posted',
        title: `Looking for: ${title}`,
        collaborationNeedId: need.id,
        projectId,
        songId,
        visibility: 'public',
      },
    });

    return NextResponse.json({ need });
  } catch (error) {
    console.error('Error creating collaboration need:', error);
    return NextResponse.json({ error: 'Failed to create collaboration need' }, { status: 500 });
  }
}
