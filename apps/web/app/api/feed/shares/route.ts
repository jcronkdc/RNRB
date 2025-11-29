import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/feed/shares
 * Share/repost a post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { postId, comment, visibility = 'public' } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and allows shares
    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
      select: {
        allowShares: true,
        userId: true,
        id: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.allowShares) {
      return NextResponse.json({ error: 'Sharing is disabled for this post' }, { status: 403 });
    }

    // Check if user already shared this post
    const existingShare = await prisma.postShare.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingShare) {
      return NextResponse.json({ error: 'You have already shared this post' }, { status: 400 });
    }

    // Create share and update share count in a transaction
    const [share] = await prisma.$transaction([
      prisma.postShare.create({
        data: {
          postId,
          userId,
          comment,
          visibility,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { shareCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ share }, { status: 201 });
  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json({ error: 'Failed to share post' }, { status: 500 });
  }
}

/**
 * GET /api/feed/shares?postId=xxx
 * Get all shares for a post
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const shares = await prisma.postShare.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      shares,
      totalCount: shares.length,
    });
  } catch (error) {
    console.error('Error fetching shares:', error);
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
  }
}

/**
 * DELETE /api/feed/shares?postId=xxx
 * Unshare a post
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = session.user.id;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Find the share
    const share = await prisma.postShare.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Delete share and update share count
    await prisma.$transaction([
      prisma.postShare.delete({
        where: { id: share.id },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { shareCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsharing post:', error);
    return NextResponse.json({ error: 'Failed to unshare post' }, { status: 500 });
  }
}
