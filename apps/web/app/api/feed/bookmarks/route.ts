import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/feed/bookmarks
 * Bookmark/save a post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { postId, collectionName } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.postBookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingBookmark) {
      // Update collection if provided
      if (collectionName !== undefined) {
        const updatedBookmark = await prisma.postBookmark.update({
          where: { id: existingBookmark.id },
          data: { collectionName },
        });
        return NextResponse.json({ bookmark: updatedBookmark });
      }

      return NextResponse.json({ error: 'Post is already bookmarked' }, { status: 400 });
    }

    // Create bookmark
    const bookmark = await prisma.postBookmark.create({
      data: {
        postId,
        userId,
        collectionName,
      },
      include: {
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
    });

    return NextResponse.json({ bookmark }, { status: 201 });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    return NextResponse.json({ error: 'Failed to bookmark post' }, { status: 500 });
  }
}

/**
 * GET /api/feed/bookmarks
 * Get user's bookmarked posts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    const bookmarks = await prisma.postBookmark.findMany({
      where: {
        userId,
        ...(collectionName && { collectionName }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            reactions: true,
            _count: {
              select: {
                reactions: true,
                comments: true,
                shares: true,
                plays: true,
              },
            },
          },
        },
      },
    });

    const nextCursor = bookmarks.length === limit ? bookmarks[bookmarks.length - 1].id : null;

    // Get unique collection names for sidebar
    const collections = await prisma.postBookmark.findMany({
      where: {
        userId,
        collectionName: { not: null },
      },
      select: { collectionName: true },
      distinct: ['collectionName'],
    });

    return NextResponse.json({
      bookmarks,
      nextCursor,
      collections: collections.map((c) => c.collectionName),
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

/**
 * DELETE /api/feed/bookmarks?postId=xxx
 * Remove bookmark
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

    // Find the bookmark
    const bookmark = await prisma.postBookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Delete bookmark
    await prisma.postBookmark.delete({
      where: { id: bookmark.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
