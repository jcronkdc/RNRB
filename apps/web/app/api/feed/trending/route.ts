import { NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';

/**
 * GET /api/feed/trending
 * Get trending hashtags, genres, and rising artists
 */
export async function GET() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get trending hashtags from tags
    const postsWithTags = await prisma.post.findMany({
      where: {
        isDeleted: false,
        visibility: 'public',
        createdAt: { gte: sevenDaysAgo },
        tags: { isEmpty: false },
      },
      select: {
        tags: true,
        likeCount: true,
        shareCount: true,
      },
    });

    // Count hashtag occurrences with engagement weighting
    const tagCounts = new Map<string, number>();
    postsWithTags.forEach((post) => {
      const weight = 1 + post.likeCount * 0.5 + post.shareCount * 2;
      post.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + weight);
      });
    });

    // Get trending genres
    const genreCounts = await prisma.post.groupBy({
      by: ['genre'],
      where: {
        isDeleted: false,
        visibility: 'public',
        createdAt: { gte: sevenDaysAgo },
        genre: { not: null },
      },
      _count: { genre: true },
      _sum: { likeCount: true, shareCount: true },
      orderBy: { _count: { genre: 'desc' } },
      take: 10,
    });

    // Combine and sort trending items
    const trendingHashtags = Array.from(tagCounts.entries())
      .map(([name, score]) => ({
        id: `tag-${name}`,
        name: `#${name}`,
        count: Math.round(score),
        type: 'hashtag' as const,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const trendingGenres = genreCounts
      .filter((g) => g.genre)
      .map((g) => ({
        id: `genre-${g.genre}`,
        name: g.genre!,
        count: g._count.genre + (g._sum.likeCount || 0) * 0.5 + (g._sum.shareCount || 0) * 2,
        type: 'genre' as const,
      }))
      .slice(0, 5);

    // Interleave hashtags and genres
    const trending: any[] = [];
    const maxLength = Math.max(trendingHashtags.length, trendingGenres.length);
    for (let i = 0; i < maxLength; i++) {
      if (trendingHashtags[i]) trending.push(trendingHashtags[i]);
      if (trendingGenres[i]) trending.push(trendingGenres[i]);
    }

    // Get rising artists (most active in last 7 days)
    const activeUsers = await prisma.post.groupBy({
      by: ['userId'],
      where: {
        isDeleted: false,
        visibility: 'public',
        createdAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
      _sum: { likeCount: true },
      orderBy: [{ _sum: { likeCount: 'desc' } }, { _count: { id: 'desc' } }],
      take: 10,
    });

    const userIds = activeUsers.map((u) => u.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    const artists = activeUsers
      .map((active) => {
        const user = users.find((u) => u.id === active.userId);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name || 'Anonymous Artist',
          image: user.image,
          postCount: active._count.id,
          followerCount: user._count.followers,
          engagementScore: (active._sum.likeCount || 0) + active._count.id * 10,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.engagementScore || 0) - (a?.engagementScore || 0))
      .slice(0, 5);

    return NextResponse.json({
      trending: trending.slice(0, 8),
      artists,
    });
  } catch (error) {
    console.error('Error fetching trending:', error);
    return NextResponse.json({ trending: [], artists: [] });
  }
}
