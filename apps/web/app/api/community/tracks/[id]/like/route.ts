import { prisma } from '@cronkwaters/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if track exists
    const track = await prisma.communityTrack.findUnique({
      where: { id },
    });

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Check if already liked
    const existing = await prisma.trackLike.findUnique({
      where: {
        communityTrackId_userId: {
          communityTrackId: id,
          userId: session.user.id,
        },
      },
    });

    let isLiked: boolean;

    if (existing) {
      // Unlike
      await prisma.trackLike.delete({
        where: { id: existing.id },
      });
      isLiked = false;
    } else {
      // Like
      await prisma.trackLike.create({
        data: {
          communityTrackId: id,
          userId: session.user.id,
        },
      });
      isLiked = true;
    }

    // Get updated like count
    const likeCount = await prisma.trackLike.count({
      where: { communityTrackId: id },
    });

    return NextResponse.json({
      isLiked,
      likeCount,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

