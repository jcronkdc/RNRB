import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

/**
 * GET /api/feed/search
 * Search posts by content, hashtags, users, or genre
 * Query params:
 * - q: search query
 * - type: 'all' | 'posts' | 'audio' | 'users' | 'hashtags'
 * - cursor: pagination cursor
 * - limit: number of results
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q')?.trim();
    const type = searchParams.get('type') || 'all';
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const results: any = {};

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          isDeleted: false,
          visibility: 'public',
          OR: [
            { content: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query.toLowerCase()] } },
            { genre: { contains: query, mode: 'insensitive' } },
            { mood: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: [{ likeCount: 'desc' }, { createdAt: 'desc' }],
        take: type === 'all' ? 5 : limit,
        skip: cursor && type !== 'all' ? 1 : 0,
        cursor: cursor && type !== 'all' ? { id: cursor } : undefined,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            },
          },
        },
      });

      results.posts = posts;
      if (type === 'posts' && posts.length === limit) {
        results.nextCursor = posts[posts.length - 1].id;
      }
    }

    // Search audio posts specifically
    if (type === 'all' || type === 'audio') {
      const audioPosts = await prisma.post.findMany({
        where: {
          isDeleted: false,
          visibility: 'public',
          contentType: 'audio',
          OR: [
            { content: { contains: query, mode: 'insensitive' } },
            { genre: { contains: query, mode: 'insensitive' } },
            { mood: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query.toLowerCase()] } },
          ],
        },
        orderBy: [{ playCount: 'desc' }, { likeCount: 'desc' }],
        take: type === 'all' ? 5 : limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              reactions: true,
              plays: true,
            },
          },
        },
      });

      results.audioPosts = audioPosts;
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: type === 'all' ? 5 : limit,
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          _count: {
            select: {
              authoredPosts: true,
              followers: true,
              following: true,
            },
          },
        },
      });

      // Add follow status if logged in
      if (session?.user?.id) {
        const userIds = users.map((u) => u.id);
        const followStatus = await prisma.userFollow.findMany({
          where: {
            followerId: session.user.id,
            followingId: { in: userIds },
          },
          select: { followingId: true },
        });

        const followingSet = new Set(followStatus.map((f) => f.followingId));
        results.users = users.map((u) => ({
          ...u,
          isFollowing: followingSet.has(u.id),
          isOwnProfile: u.id === session?.user?.id,
        }));
      } else {
        results.users = users;
      }
    }

    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      // Get posts with matching tags and aggregate
      const postsWithTags = await prisma.post.findMany({
        where: {
          isDeleted: false,
          visibility: 'public',
          tags: { hasSome: [query.toLowerCase()] },
        },
        select: {
          tags: true,
          likeCount: true,
        },
      });

      const tagCounts = new Map<string, number>();
      postsWithTags.forEach((post) => {
        post.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1 + post.likeCount * 0.5);
          }
        });
      });

      results.hashtags = Array.from(tagCounts.entries())
        .map(([tag, score]) => ({ tag, postCount: Math.round(score) }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, type === 'all' ? 5 : limit);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
