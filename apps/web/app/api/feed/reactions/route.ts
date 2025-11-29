import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * POST /api/feed/reactions
 * Add or toggle a reaction to a post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { postId, emoji } = await request.json();

    if (!postId || !emoji) {
      return NextResponse.json({ error: 'Post ID and emoji are required' }, { status: 400 });
    }

    // Check if post exists and allows reactions
    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
      select: { allowReactions: true, likeCount: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.allowReactions) {
      return NextResponse.json({ error: 'Reactions are disabled for this post' }, { status: 403 });
    }

    // Check if user already reacted with this emoji
    const existingReaction = await prisma.postReaction.findUnique({
      where: {
        postId_userId_emoji: {
          postId,
          userId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove the reaction (toggle off)
      await prisma.$transaction([
        prisma.postReaction.delete({
          where: { id: existingReaction.id },
        }),
        prisma.post.update({
          where: { id: postId },
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
        prisma.postReaction.create({
          data: {
            postId,
            userId,
            emoji,
          },
        }),
        prisma.post.update({
          where: { id: postId },
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
    console.error('Error toggling reaction:', error);
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
  }
}

/**
 * GET /api/feed/reactions?postId=xxx
 * Get all reactions for a post
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const reactions = await prisma.postReaction.findMany({
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
    console.error('Error fetching reactions:', error);
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}
