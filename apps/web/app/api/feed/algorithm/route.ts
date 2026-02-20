import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import {
  validateCursor,
  validateLimit,
  rateLimitUser,
  logSecurityEvent,
  getClientIp,
} from '@/lib/security';

/**
 * GET /api/feed/algorithm
 * Smart feed algorithm that combines following, trending, and personalized content
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - 100 requests per minute per user
    if (!rateLimitUser(session.user.id, 'feed-algorithm', 100)) {
      logSecurityEvent('rate_limit', {
        userId: session.user.id,
        action: 'feed-algorithm',
        ip: getClientIp(request),
      });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    // SECURITY: Validate and sanitize inputs to prevent SQL injection
    const cursor = validateCursor(searchParams.get('cursor'));
    const limit = validateLimit(searchParams.get('limit'), 50, 20);
    const userId = session.user.id;

    // 1. Get user's following list
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // 2. Get user's interests (based on reactions and plays)
    const userInteractions = await prisma.postReaction.findMany({
      where: { userId },
      include: {
        post: {
          select: { genre: true, mood: true, tags: true },
        },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    // Extract preferred genres and moods
    const genresSet = new Set<string>();
    const moodsSet = new Set<string>();
    const tagsSet = new Set<string>();

    userInteractions.forEach((interaction) => {
      if (interaction.post.genre) genresSet.add(interaction.post.genre);
      if (interaction.post.mood) moodsSet.add(interaction.post.mood);
      interaction.post.tags.forEach((tag) => tagsSet.add(tag));
    });

    const preferredGenres = Array.from(genresSet);
    const preferredMoods = Array.from(moodsSet);
    const preferredTags = Array.from(tagsSet);

    // 3. Build smart feed query using Prisma's safe parameterized queries
    // Priority: Following > Trending > Similar Interests > Popular
    // SECURITY: Using Prisma's built-in parameterization to prevent SQL injection
    const posts = cursor
      ? await prisma.$queryRaw`
          WITH scored_posts AS (
            SELECT 
              p.*,
              CASE
                -- Posts from people you follow (highest priority)
                WHEN p."userId" = ANY(${followingIds}::text[]) THEN 100
                
                -- Trending posts (high engagement in last 24 hours)
                WHEN p."createdAt" > NOW() - INTERVAL '24 hours'
                  AND (p."likeCount" > 10 OR p."shareCount" > 3) THEN 80
                
                -- Posts matching your interests
                WHEN p."genre" = ANY(${preferredGenres}::text[])
                  OR p."mood" = ANY(${preferredMoods}::text[]) THEN 60
                
                -- Popular public posts
                WHEN p."visibility" = 'public'
                  AND (p."likeCount" > 5 OR p."commentCount" > 3) THEN 40
                
                -- New public posts (discovery)
                WHEN p."visibility" = 'public' 
                  AND p."createdAt" > NOW() - INTERVAL '7 days' THEN 20
                
                ELSE 10
              END as score
            FROM "Post" p
            WHERE p."isDeleted" = false
              AND p."visibility" = 'public'
              AND p."createdAt" < (SELECT "createdAt" FROM "Post" WHERE id = ${cursor})
            ORDER BY score DESC, p."createdAt" DESC
            LIMIT ${limit}
          )
          SELECT * FROM scored_posts
        `
      : await prisma.$queryRaw`
          WITH scored_posts AS (
            SELECT 
              p.*,
              CASE
                -- Posts from people you follow (highest priority)
                WHEN p."userId" = ANY(${followingIds}::text[]) THEN 100
                
                -- Trending posts (high engagement in last 24 hours)
                WHEN p."createdAt" > NOW() - INTERVAL '24 hours'
                  AND (p."likeCount" > 10 OR p."shareCount" > 3) THEN 80
                
                -- Posts matching your interests
                WHEN p."genre" = ANY(${preferredGenres}::text[])
                  OR p."mood" = ANY(${preferredMoods}::text[]) THEN 60
                
                -- Popular public posts
                WHEN p."visibility" = 'public'
                  AND (p."likeCount" > 5 OR p."commentCount" > 3) THEN 40
                
                -- New public posts (discovery)
                WHEN p."visibility" = 'public' 
                  AND p."createdAt" > NOW() - INTERVAL '7 days' THEN 20
                
                ELSE 10
              END as score
            FROM "Post" p
            WHERE p."isDeleted" = false
              AND p."visibility" = 'public'
            ORDER BY score DESC, p."createdAt" DESC
            LIMIT ${limit}
          )
          SELECT * FROM scored_posts
        `;

    // Get full post data with relations
    const postIds = (posts as any[]).map((p: any) => p.id);

    const fullPosts = await prisma.post.findMany({
      where: { id: { in: postIds } },
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
          where: { parentId: null },
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

    // Sort by original order
    const sortedPosts = postIds
      .map((id: string) => fullPosts.find((p) => p.id === id))
      .filter(Boolean);

    // Batch-fetch user interactions (replaces N+1 pattern)
    const sortedPostIds = sortedPosts.map((p: any) => p.id);

    const [userReactions, userBookmarks, userShares] = await Promise.all([
      prisma.postReaction.findMany({
        where: { postId: { in: sortedPostIds }, userId },
      }),
      prisma.postBookmark.findMany({
        where: { postId: { in: sortedPostIds }, userId },
      }),
      prisma.postShare.findMany({
        where: { postId: { in: sortedPostIds }, userId },
      }),
    ]);

    const reactionMap = new Map(userReactions.map((r: any) => [r.postId, r.emoji]));
    const bookmarkSet = new Set(userBookmarks.map((b: any) => b.postId));
    const shareSet = new Set(userShares.map((s: any) => s.postId));

    const postsWithUserData = sortedPosts.map((post: any) => ({
      ...post,
      currentUserReaction: reactionMap.get(post.id) || null,
      currentUserBookmarked: bookmarkSet.has(post.id),
      currentUserShared: shareSet.has(post.id),
    }));

    const nextCursor =
      sortedPosts.length === limit ? sortedPosts[sortedPosts.length - 1]?.id : null;

    return NextResponse.json({
      posts: postsWithUserData,
      nextCursor,
      algorithm: {
        followingCount: followingIds.length,
        preferredGenres,
        preferredMoods,
        preferredTags: Array.from(tagsSet).slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Error fetching algorithmic feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}
