import { prisma } from '@cronkwaters/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const track = await prisma.communityTrack.findUnique({
      where: { id },
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
            lyrics: true,
            key: true,
            tempo: true,
            timeSignature: true,
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

    if (!track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Check if current user has liked this track
    const session = await auth();
    let isLikedByCurrentUser = false;

    if (session?.user?.id) {
      const like = await prisma.trackLike.findUnique({
        where: {
          communityTrackId_userId: {
            communityTrackId: id,
            userId: session.user.id,
          },
        },
      });
      isLikedByCurrentUser = !!like;
    }

    return NextResponse.json({
      track: {
        ...track,
        isLikedByCurrentUser,
      },
    });
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json({ error: 'Failed to fetch track' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify track belongs to user
    const existing = await prisma.communityTrack.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only update your own tracks' }, { status: 403 });
    }

    const body = await request.json();
    const { coverUrl, genre, mood, bpm, allowDownload, allowRemix } = body;

    const track = await prisma.communityTrack.update({
      where: { id },
      data: {
        ...(coverUrl !== undefined && { coverUrl }),
        ...(genre !== undefined && { genre }),
        ...(mood !== undefined && { mood }),
        ...(bpm !== undefined && { bpm }),
        ...(allowDownload !== undefined && { allowDownload }),
        ...(allowRemix !== undefined && { allowRemix }),
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

    return NextResponse.json({ track });
  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json({ error: 'Failed to update track' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify track belongs to user
    const existing = await prisma.communityTrack.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own tracks' }, { status: 403 });
    }

    // Delete will cascade to likes, plays, comments
    await prisma.communityTrack.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json({ error: 'Failed to delete track' }, { status: 500 });
  }
}

