import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

// GET - Fetch current activity status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get activity status from user's musician profile
    const profile = await prisma.musicianProfile.findFirst({
      where: { userId },
      select: {
        currentStatus: true,
        statusMessage: true,
        updatedAt: true,
      },
    });

    // Check if activity is stale (older than 8 hours)
    const isStale = profile?.updatedAt
      ? Date.now() - new Date(profile.updatedAt).getTime() > 8 * 60 * 60 * 1000
      : true;

    return NextResponse.json({
      activity: isStale ? null : profile?.currentStatus || null,
      customMessage: isStale ? null : profile?.statusMessage || null,
      updatedAt: isStale ? null : profile?.updatedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error fetching activity status:', error);
    return NextResponse.json({ error: 'Failed to fetch activity status' }, { status: 500 });
  }
}

// POST - Update activity status
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { activity, customMessage } = body;

    // Validate activity
    const validActivities = [
      'writing',
      'recording',
      'practicing',
      'listening',
      'mixing',
      'jamming',
      'learning',
      'composing',
    ];

    if (activity && !validActivities.includes(activity)) {
      return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    // Update or create musician profile with activity
    const profile = await prisma.musicianProfile.upsert({
      where: { userId },
      create: {
        userId,
        currentStatus: activity,
        statusMessage: customMessage?.slice(0, 100) || null,
      },
      update: {
        currentStatus: activity,
        statusMessage: customMessage?.slice(0, 100) || null,
      },
    });

    return NextResponse.json({
      activity: profile.currentStatus,
      customMessage: profile.statusMessage,
      updatedAt: profile.updatedAt?.toISOString(),
    });
  } catch (error) {
    console.error('Error updating activity status:', error);
    return NextResponse.json({ error: 'Failed to update activity status' }, { status: 500 });
  }
}

// DELETE - Clear activity status
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.musicianProfile.updateMany({
      where: { userId },
      data: {
        currentStatus: null,
        statusMessage: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing activity status:', error);
    return NextResponse.json({ error: 'Failed to clear activity status' }, { status: 500 });
  }
}
