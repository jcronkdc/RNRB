'use server';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';
import { standardLimiter } from '@/lib/rate-limit';

// PATCH /api/comments/pinned/[commentId] - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const limitResult = await standardLimiter(request);
    if (limitResult) return limitResult;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { commentId } = await params;
    const body = await request.json();
    const { content } = body;

    // Check ownership
    const existing = await prisma.pinnedComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this comment' }, { status: 403 });
    }

    const comment = await prisma.pinnedComment.update({
      where: { id: commentId },
      data: { content },
    });

    // Transform response
    const transformedComment = {
      id: comment.id,
      entityId: comment.entityId,
      entityType: comment.entityType,
      location: {
        lineNumber: comment.lineNumber,
        timestamp: comment.timestamp,
        selection: comment.selection,
      },
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      content: comment.content,
      isResolved: comment.isResolved,
      resolvedAt: comment.resolvedAt,
      resolvedBy: comment.resolvedBy,
      threadId: comment.threadId,
      reactions: comment.reactions,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    return NextResponse.json({ comment: transformedComment });
  } catch (error) {
    console.error('Error updating pinned comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE /api/comments/pinned/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const limitResult = await standardLimiter(request);
    if (limitResult) return limitResult;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { commentId } = await params;

    // Check ownership
    const existing = await prisma.pinnedComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
    }

    // Delete the comment and all its replies
    await prisma.pinnedComment.deleteMany({
      where: {
        OR: [{ id: commentId }, { threadId: commentId }],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pinned comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
