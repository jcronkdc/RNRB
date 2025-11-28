import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

/**
 * GET /api/feed/posts
 * Fetch posts for the feed with smart filtering
 * Query params:
 * - type: 'following' | 'public' | 'discover' | 'audio'
 * - cursor: pagination cursor
 * - limit: number of posts (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'following';
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    const userId = session.user.id;

    // Base query conditions
    let whereClause: any = {
      isDeleted: false,
    };

    // Different feed types
    if (type === 'following') {
      // Show posts from people you follow + your own posts
      const following = await prisma.userFollow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);
      whereClause.OR = [
        { userId: { in: [...followingIds, userId] } },
        { visibility: 'public' }, // Also show public posts
      ];
    } else if (type === 'public') {
      // Show all public posts
      whereClause.visibility = 'public';
    } else if (type === 'discover') {
      // Show trending public posts (high engagement)
      whereClause.visibility = 'public';
      whereClause.OR = [
        { likeCount: { gte: 10 } },
        { commentCount: { gte: 5 } },
        { shareCount: { gte: 3 } },
        { playCount: { gte: 50 } },
      ];
    } else if (type === 'audio') {
      // Audio-only posts (SoundCloud mode)
      whereClause.contentType = 'audio';
      whereClause.visibility = 'public';
    }

    // Pagination
    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
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
          where: { parentId: null }, // Top-level comments only
          orderBy: { createdAt: 'desc' },
          take: 3,
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

    // Check if user has reacted/bookmarked each post
    const postsWithUserData = await Promise.all(
      posts.map(async (post) => {
        const [userReaction, userBookmark, userShare] = await Promise.all([
          prisma.postReaction.findFirst({
            where: { postId: post.id, userId },
          }),
          prisma.postBookmark.findFirst({
            where: { postId: post.id, userId },
          }),
          prisma.postShare.findFirst({
            where: { postId: post.id, userId },
          }),
        ]);

        return {
          ...post,
          currentUserReaction: userReaction?.emoji || null,
          currentUserBookmarked: !!userBookmark,
          currentUserShared: !!userShare,
        };
      })
    );

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

    return NextResponse.json({
      posts: postsWithUserData,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

/**
 * POST /api/feed/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      content,
      contentType = 'text',
      audioUrl,
      audioPath,
      waveformData,
      duration,
      bpm,
      key,
      imageUrls = [],
      videoUrl,
      linkUrl,
      linkPreview,
      genre,
      mood,
      tags = [],
      visibility = 'public',
      allowComments = true,
      allowReactions = true,
      allowShares = true,
      originalPostId, // For shares/reposts
    } = body;

    // Validate required fields based on content type
    if (contentType === 'audio' && !audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required for audio posts' }, { status: 400 });
    }

    if (!content && !audioUrl && imageUrls.length === 0 && !videoUrl) {
      return NextResponse.json({ error: 'Post must have content or media' }, { status: 400 });
    }

    // If this is a share/repost, get original post data
    let sharedFromUserId = null;
    if (originalPostId) {
      const originalPost = await prisma.post.findUnique({
        where: { id: originalPostId },
        select: { userId: true },
      });

      if (!originalPost) {
        return NextResponse.json({ error: 'Original post not found' }, { status: 404 });
      }

      sharedFromUserId = originalPost.userId;

      // Increment share count on original post
      await prisma.post.update({
        where: { id: originalPostId },
        data: { shareCount: { increment: 1 } },
      });
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        userId,
        content,
        contentType,
        audioUrl,
        audioPath,
        waveformData,
        duration,
        bpm,
        key,
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
        originalPostId,
        sharedFromUserId,
      },
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
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
