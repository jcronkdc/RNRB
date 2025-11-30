'use server';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';
import { standardLimiter } from '@/lib/rate-limit';

// POST /api/comments/pinned/[commentId]/resolve - Resolve/unresolve a comment
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
    const { resolved, resolvedBy } = body;

    const existing = await prisma.pinnedComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const comment = await prisma.pinnedComment.update({
      where: { id: commentId },
      data: {
        isResolved: resolved,
        resolvedAt: resolved ? new Date() : null,
        resolvedBy: resolved ? resolvedBy || session.user.id : null,
      },
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
    console.error('Error resolving pinned comment:', error);
    return NextResponse.json({ error: 'Failed to resolve comment' }, { status: 500 });
  }
}
