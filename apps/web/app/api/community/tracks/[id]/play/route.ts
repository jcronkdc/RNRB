import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { duration, completed } = body;

    // Check if track exists
    const track = await prisma.communityTrack.findUnique({
      where: { id },
    });

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    const session = await auth();

    // Create play record
    await prisma.trackPlay.create({
      data: {
        communityTrackId: id,
        userId: session?.user?.id || null,
        ipAddress:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        duration: duration || null,
        completedAt: completed ? new Date() : null,
      },
    });

    // Get updated play count
    const playCount = await prisma.trackPlay.count({
      where: { communityTrackId: id },
    });

    return NextResponse.json({
      playCount,
      success: true,
    });
  } catch (error) {
    console.error('Error recording play:', error);
    return NextResponse.json({ error: 'Failed to record play' }, { status: 500 });
  }
}
