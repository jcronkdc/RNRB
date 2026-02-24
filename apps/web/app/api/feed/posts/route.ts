import { prisma } from '@cronkwaters/db';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/auth';
import { checkRateLimit, standardLimiter, strictLimiter } from '@/lib/rate-limit';
import {
  getClientIp,
  logSecurityEvent,
  sanitizeContent,
  validateContentType,
  validateCursor,
  validateLimit,
  validateUrl,
  validateVisibility,
} from '@/lib/security';

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

    // Rate limiting
    try {
      await checkRateLimit(standardLimiter, `feed-posts-read:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type') || 'following';
    // SECURITY: Validate feed type to prevent injection
    const validTypes = ['following', 'public', 'discover', 'audio'];
    const type = validTypes.includes(typeParam) ? typeParam : 'following';
    // SECURITY: Validate cursor and limit
    const cursor = validateCursor(searchParams.get('cursor'));
    const limit = validateLimit(searchParams.get('limit'), 50, 20);
    // Hashtag filter
    const tagFilter = searchParams.get('tag')?.toLowerCase().trim();
    // Genre filter
    const genreFilter = searchParams.get('genre')?.toLowerCase().trim();

    const userId = session.user.id;

    // Base query conditions
    const whereClause: any = {
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

    // Apply hashtag filter if provided
    if (tagFilter) {
      whereClause.tags = { has: tagFilter };
      whereClause.visibility = 'public'; // Only show public posts for tag search
    }

    // Apply genre filter if provided
    if (genreFilter) {
      whereClause.genre = { equals: genreFilter, mode: 'insensitive' };
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

    // Batch-fetch user interactions for all posts at once (replaces N+1 pattern)
    const postIds = posts.map((p) => p.id);

    const [userReactions, userBookmarks, userShares] = await Promise.all([
      prisma.postReaction.findMany({
        where: { postId: { in: postIds }, userId },
      }),
      prisma.postBookmark.findMany({
        where: { postId: { in: postIds }, userId },
      }),
      prisma.postShare.findMany({
        where: { postId: { in: postIds }, userId },
      }),
    ]);

    // Build lookup maps for O(1) access
    const reactionMap = new Map(userReactions.map((r) => [r.postId, r.emoji]));
    const bookmarkSet = new Set(userBookmarks.map((b) => b.postId));
    const shareSet = new Set(userShares.map((s) => s.postId));

    const postsWithUserData = posts.map((post) => ({
      ...post,
      currentUserReaction: reactionMap.get(post.id) || null,
      currentUserBookmarked: bookmarkSet.has(post.id),
      currentUserShared: shareSet.has(post.id),
    }));

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

    // Rate limiting - 30 posts per hour
    try {
      await checkRateLimit(strictLimiter, `feed-posts-create:${session.user.id}`);
    } catch {
      logSecurityEvent('rate_limit', {
        userId: session.user.id,
        action: 'post-create',
        ip: getClientIp(request),
      });
      return NextResponse.json(
        { error: 'Too many posts. Please wait before posting again.' },
        { status: 429 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // SECURITY: Sanitize and validate all inputs
    const content = sanitizeContent(body.content, 10000);
    const contentType = validateContentType(body.contentType);
    const audioUrl = validateUrl(body.audioUrl);
    const audioPath = body.audioPath ? sanitizeContent(body.audioPath, 500) : null;
    const waveformData = body.waveformData; // JSON data, validated by Prisma
    const duration =
      typeof body.duration === 'number' && body.duration > 0
        ? Math.min(body.duration, 36000)
        : null;
    const bpm = typeof body.bpm === 'number' && body.bpm > 0 ? Math.min(body.bpm, 999) : null;
    const key = body.key ? sanitizeContent(body.key, 10) : null;
    // Validate image URLs array
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((url: string) => validateUrl(url)).slice(0, 10)
      : [];
    const videoUrl = validateUrl(body.videoUrl);
    const linkUrl = validateUrl(body.linkUrl);
    const linkPreview = body.linkPreview; // JSON data
    const genre = body.genre ? sanitizeContent(body.genre, 50) : null;
    const mood = body.mood ? sanitizeContent(body.mood, 50) : null;
    // Validate tags array
    const tags = Array.isArray(body.tags)
      ? body.tags
          .map((t: string) => sanitizeContent(t, 50))
          .filter(Boolean)
          .slice(0, 20)
      : [];
    const visibility = validateVisibility(body.visibility);
    const allowComments = body.allowComments !== false;
    const allowReactions = body.allowReactions !== false;
    const allowShares = body.allowShares !== false;
    const originalPostId = body.originalPostId; // Will be validated below

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
