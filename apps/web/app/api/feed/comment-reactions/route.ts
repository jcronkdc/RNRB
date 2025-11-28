import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

/**
 * POST /api/feed/comment-reactions
 * Add or toggle a reaction to a comment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { commentId, emoji } = await request.json();

    if (!commentId || !emoji) {
      return NextResponse.json({ error: 'Comment ID and emoji are required' }, { status: 400 });
    }

    // Check if comment exists
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user already reacted with this emoji
    const existingReaction = await prisma.postCommentReaction.findUnique({
      where: {
        commentId_userId_emoji: {
          commentId,
          userId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove the reaction (toggle off)
      await prisma.$transaction([
        prisma.postCommentReaction.delete({
          where: { id: existingReaction.id },
        }),
        prisma.postComment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        action: 'removed',
        emoji,
      });
    } else {
      // Add the reaction
      await prisma.$transaction([
        prisma.postCommentReaction.create({
          data: {
            commentId,
            userId,
            emoji,
          },
        }),
        prisma.postComment.update({
          where: { id: commentId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        action: 'added',
        emoji,
      });
    }
  } catch (error) {
    console.error('Error toggling comment reaction:', error);
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
  }
}

/**
 * GET /api/feed/comment-reactions?commentId=xxx
 * Get all reactions for a comment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const reactions = await prisma.postCommentReaction.findMany({
      where: { commentId },
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

    // Group by emoji
    const groupedReactions = reactions.reduce(
      (acc: any, reaction: any) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction.user);
        return acc;
      },
      {} as Record<string, any[]>
    );

    return NextResponse.json({
      reactions,
      groupedReactions,
      totalCount: reactions.length,
    });
  } catch (error) {
    console.error('Error fetching comment reactions:', error);
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}
