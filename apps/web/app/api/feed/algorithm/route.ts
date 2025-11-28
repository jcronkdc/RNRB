import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

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

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');
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

    // 3. Build smart feed query
    // Priority: Following > Trending > Similar Interests > Popular
    const posts = await prisma.$queryRaw`
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
          ${cursor ? `AND p."createdAt" < (SELECT "createdAt" FROM "Post" WHERE id = ${cursor})` : ''}
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

    // Check user's interactions with each post
    const postsWithUserData = await Promise.all(
      sortedPosts.map(async (post: any) => {
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
