import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

/**
 * GET /api/feed/posts/[id]
 * Get a single post by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        originalPost: {
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
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: { replies: true },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            shares: true,
            plays: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check privacy
    if (post.visibility === 'private' && post.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Add user-specific data if logged in
    let userReaction = null;
    let userBookmark = null;
    let userShare = null;

    if (session?.user?.id) {
      [userReaction, userBookmark, userShare] = await Promise.all([
        prisma.postReaction.findFirst({
          where: { postId, userId: session.user.id },
        }),
        prisma.postBookmark.findFirst({
          where: { postId, userId: session.user.id },
        }),
        prisma.postShare.findFirst({
          where: { postId, userId: session.user.id },
        }),
      ]);
    }

    return NextResponse.json({
      post: {
        ...post,
        currentUserReaction: userReaction?.emoji || null,
        currentUserBookmarked: !!userBookmark,
        currentUserShared: !!userShare,
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

/**
 * PATCH /api/feed/posts/[id]
 * Update a post (must be the author)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id;
    const body = await request.json();

    // Check ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, isDeleted: true },
    });

    if (!existingPost || existingPost.isDeleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the post
    const {
      content,
      imageUrls,
      videoUrl,
      linkUrl,
      linkPreview,
      genre,
      mood,
      tags,
      visibility,
      allowComments,
      allowReactions,
      allowShares,
    } = body;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        imageUrls,
        videoUrl,
        linkUrl,
        linkPreview,
        genre,
        mood,
        tags,
        visibility,
        allowComments,
        allowReactions,
        allowShares,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

/**
 * DELETE /api/feed/posts/[id]
 * Soft delete a post (must be the author)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = await params;
    const userId = session.user.id;

    // Check ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, isDeleted: true },
    });

    if (!existingPost || existingPost.isDeleted) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    await prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
