import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

/**
 * POST /api/feed/plays
 * Track when a user plays audio content
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { postId, duration, completed } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and is audio
    const post = await prisma.post.findUnique({
      where: { id: postId, isDeleted: false },
      select: { id: true, contentType: true, playCount: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get client IP for anonymous tracking
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Prevent spam plays - check if same user/IP played in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentPlay = await prisma.postPlay.findFirst({
      where: {
        postId,
        OR: [...(session?.user?.id ? [{ userId: session.user.id }] : []), { ipAddress }],
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (recentPlay) {
      // Update existing play with duration if longer
      if (duration && (!recentPlay.duration || duration > recentPlay.duration)) {
        await prisma.postPlay.update({
          where: { id: recentPlay.id },
          data: {
            duration,
            completedAt: completed ? new Date() : recentPlay.completedAt,
          },
        });
      }
      return NextResponse.json({ success: true, action: 'updated' });
    }

    // Create new play record
    const [play] = await prisma.$transaction([
      prisma.postPlay.create({
        data: {
          postId,
          userId: session?.user?.id || null,
          ipAddress: session?.user?.id ? null : ipAddress,
          duration,
          completedAt: completed ? new Date() : null,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { playCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      action: 'created',
      playId: play.id,
      newPlayCount: post.playCount + 1,
    });
  } catch (error) {
    console.error('Error tracking play:', error);
    return NextResponse.json({ error: 'Failed to track play' }, { status: 500 });
  }
}

/**
 * GET /api/feed/plays?postId=xxx
 * Get play statistics for a post
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const [totalPlays, uniquePlays, completedPlays, avgDuration] = await Promise.all([
      prisma.postPlay.count({ where: { postId } }),
      prisma.postPlay.groupBy({
        by: ['userId'],
        where: { postId, userId: { not: null } },
      }),
      prisma.postPlay.count({ where: { postId, completedAt: { not: null } } }),
      prisma.postPlay.aggregate({
        where: { postId, duration: { not: null } },
        _avg: { duration: true },
      }),
    ]);

    return NextResponse.json({
      totalPlays,
      uniqueListeners: uniquePlays.length,
      completedPlays,
      completionRate: totalPlays > 0 ? (completedPlays / totalPlays) * 100 : 0,
      averageDuration: avgDuration._avg.duration || 0,
    });
  } catch (error) {
    console.error('Error fetching play stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
