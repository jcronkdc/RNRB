'use server';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';
import { checkStandardLimit } from '@/lib/rate-limit';

// GET /api/comments/pinned - Get pinned comments for an entity
export async function GET(request: NextRequest) {
  try {
    const limitResult = await checkStandardLimit(request);
    if (limitResult) return limitResult;

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const entityType = searchParams.get('entityType');
    const includeResolved = searchParams.get('includeResolved') === 'true';

    if (!entityId || !entityType) {
      return NextResponse.json({ error: 'entityId and entityType are required' }, { status: 400 });
    }

    const comments = await prisma.pinnedComment.findMany({
      where: {
        entityId,
        entityType,
        ...(includeResolved ? {} : {}), // Include all by default, UI can filter
      },
      orderBy: [
        { timestamp: 'asc' }, // Sort by timestamp first (for audio comments)
        { lineNumber: 'asc' }, // Then by line number (for lyric comments)
        { createdAt: 'desc' }, // Then by newest
      ],
    });

    // Transform to match the hook's expected format
    const transformedComments = comments.map((c) => ({
      id: c.id,
      entityId: c.entityId,
      entityType: c.entityType,
      location: {
        lineNumber: c.lineNumber,
        timestamp: c.timestamp,
        selection: c.selection as { start: number; end: number } | null,
      },
      userId: c.userId,
      userName: c.userName,
      userAvatar: c.userAvatar,
      content: c.content,
      isResolved: c.isResolved,
      resolvedAt: c.resolvedAt,
      resolvedBy: c.resolvedBy,
      threadId: c.threadId,
      reactions: c.reactions as Record<string, string[]> | null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ comments: transformedComments });
  } catch (error) {
    console.error('Error fetching pinned comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST /api/comments/pinned - Create a new pinned comment
export async function POST(request: NextRequest) {
  try {
    const limitResult = await checkStandardLimit(request);
    if (limitResult) return limitResult;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { entityId, entityType, content, location, threadId, userId, userName, userAvatar } =
      body;

    if (!entityId || !entityType || !content) {
      return NextResponse.json(
        { error: 'entityId, entityType, and content are required' },
        { status: 400 }
      );
    }

    const comment = await prisma.pinnedComment.create({
      data: {
        entityId,
        entityType,
        content,
        lineNumber: location?.lineNumber,
        timestamp: location?.timestamp,
        selection: location?.selection,
        threadId,
        userId: userId || session.user.id,
        userName: userName || session.user.name || 'Unknown',
        userAvatar: userAvatar || session.user.image,
        isResolved: false,
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

    return NextResponse.json({ comment: transformedComment }, { status: 201 });
  } catch (error) {
    console.error('Error creating pinned comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
