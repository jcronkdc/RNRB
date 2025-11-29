import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/feed/comments
 * Add a comment to a post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { postId, content, parentId, audioUrl, audioDuration } = await request.json();

    if (!postId || (!content && !audioUrl)) {
      return NextResponse.json(
        { error: 'Post ID and content/audio are required' },
        { status: 400 }
      );
    }

    // Check if post exists and allows comments
    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
      select: { allowComments: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.allowComments) {
      return NextResponse.json({ error: 'Comments are disabled for this post' }, { status: 403 });
    }

    // If parentId provided, verify it exists
    if (parentId) {
      const parentComment = await prisma.postComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    // Create comment and update counts in a transaction
    const [comment] = await prisma.$transaction([
      prisma.postComment.create({
        data: {
          postId,
          userId,
          content,
          parentId,
          audioUrl,
          audioDuration,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: { replies: true },
          },
        },
      }),
      // Increment comment count on post
      prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
      // If this is a reply, increment reply count on parent
      ...(parentId
        ? [
            prisma.postComment.update({
              where: { id: parentId },
              data: { replyCount: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

/**
 * GET /api/feed/comments?postId=xxx&parentId=xxx
 * Get comments for a post (or replies to a comment)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const parentId = searchParams.get('parentId');
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const comments = await prisma.postComment.findMany({
      where: {
        postId,
        parentId: parentId || null,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
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
          select: {
            replies: true,
            reactions: true,
          },
        },
      },
    });

    const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null;

    return NextResponse.json({
      comments,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

/**
 * PATCH /api/feed/comments?id=xxx
 * Update a comment (must be the author)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    const userId = session.user.id;
    const { content } = await request.json();

    if (!commentId || !content) {
      return NextResponse.json({ error: 'Comment ID and content are required' }, { status: 400 });
    }

    // Check ownership
    const existingComment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the comment
    const updatedComment = await prisma.postComment.update({
      where: { id: commentId },
      data: {
        content,
        editedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

/**
 * DELETE /api/feed/comments?id=xxx
 * Delete a comment (must be the author or post owner)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    const userId = session.user.id;

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Get comment and post data
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { userId: true, id: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user is comment author or post owner
    if (comment.userId !== userId && comment.post.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete comment and update counts
    await prisma.$transaction([
      prisma.postComment.delete({
        where: { id: commentId },
      }),
      prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
      // If this is a reply, decrement parent reply count
      ...(comment.parentId
        ? [
            prisma.postComment.update({
              where: { id: comment.parentId },
              data: { replyCount: { decrement: 1 } },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
