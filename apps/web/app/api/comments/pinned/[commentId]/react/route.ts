'use server';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';
import { standardLimiter } from '@/lib/rate-limit';

// POST /api/comments/pinned/[commentId]/react - Add a reaction
export async function POST(
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
    const { emoji, userId } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'emoji is required' }, { status: 400 });
    }

    const existing = await prisma.pinnedComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Get current reactions
    const reactions = (existing.reactions as Record<string, string[]>) || {};
    const userIdToUse = userId || session.user.id;

    // Add user to this emoji's reactions (if not already there)
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    if (!reactions[emoji].includes(userIdToUse)) {
      reactions[emoji].push(userIdToUse);
    }

    const comment = await prisma.pinnedComment.update({
      where: { id: commentId },
      data: { reactions },
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
    console.error('Error adding reaction:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

// DELETE /api/comments/pinned/[commentId]/react - Remove a reaction
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
    const body = await request.json();
    const { emoji, userId } = body;

    if (!emoji) {
      return NextResponse.json({ error: 'emoji is required' }, { status: 400 });
    }

    const existing = await prisma.pinnedComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Get current reactions
    const reactions = (existing.reactions as Record<string, string[]>) || {};
    const userIdToUse = userId || session.user.id;

    // Remove user from this emoji's reactions
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id) => id !== userIdToUse);
      // Clean up empty arrays
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    const comment = await prisma.pinnedComment.update({
      where: { id: commentId },
      data: { reactions },
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
    console.error('Error removing reaction:', error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}
