import { prisma } from '@cronkwaters/db';
import { Hash, TrendingUp, Music, Users, Sparkles, ArrowRight } from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { FeedSkeleton, TableSkeleton, UsersSkeleton } from '@/components/loading-skeletons';
import { ROUTES } from '@/lib/routes';

import { microCopy } from '@/lib/workshop-voice';

export const metadata = {
  title: "Explore | Rock N' Roll Basement",
  description: 'Discover trending hashtags, genres, and rising artists',
};

async function TrendingHashtags() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

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

  const tagCounts = new Map<string, { count: number; engagement: number }>();
  postsWithTags.forEach((post) => {
    const engagement = 1 + post.likeCount * 0.5 + post.shareCount * 2;
    post.tags.forEach((tag) => {
      const existing = tagCounts.get(tag) || { count: 0, engagement: 0 };
      tagCounts.set(tag, {
        count: existing.count + 1,
        engagement: existing.engagement + engagement,
      });
    });
  });

  const trending = Array.from(tagCounts.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      engagement: Math.round(data.engagement),
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 12);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {trending.map((tag, index) => (
        <Link
          key={tag.name}
          href={`/feed?tag=${encodeURIComponent(tag.name)}`}
          className="group relative overflow-hidden rounded-xl p-4 transition-all"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div
            className="absolute right-2 top-2 text-3xl font-bold"
            style={{ color: 'var(--border)' }}
          >
            {index + 1}
          </div>
          <Hash className="mb-2 h-5 w-5" style={{ color: 'var(--accent)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>
            {tag.name}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            {tag.count} {tag.count === 1 ? 'post' : 'posts'}
          </p>
        </Link>
      ))}
    </div>
  );
}

async function TrendingGenres() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const genres = await prisma.post.groupBy({
    by: ['genre'],
    where: {
      isDeleted: false,
      visibility: 'public',
      createdAt: { gte: sevenDaysAgo },
      genre: { not: null },
    },
    _count: { genre: true },
    _sum: { likeCount: true, playCount: true },
    orderBy: { _count: { genre: 'desc' } },
    take: 8,
  });

  return (
    <div className="flex flex-wrap gap-3">
      {genres
        .filter((g) => g.genre)
        .map((genre) => (
          <Link
            key={genre.genre}
            href={`/feed?genre=${encodeURIComponent(genre.genre!)}`}
            className="group flex items-center gap-3 rounded-full px-5 py-3 transition-all"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <Music className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--text)' }}>
              {genre.genre}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{ background: 'var(--bg)', color: 'var(--muted)' }}
            >
              {genre._count.genre}
            </span>
          </Link>
        ))}
    </div>
  );
}

async function RisingArtists() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const activeUsers = await prisma.post.groupBy({
    by: ['userId'],
    where: {
      isDeleted: false,
      visibility: 'public',
      createdAt: { gte: sevenDaysAgo },
    },
    _count: { id: true },
    _sum: { likeCount: true, playCount: true },
    orderBy: [{ _sum: { likeCount: 'desc' } }, { _count: { id: 'desc' } }],
    take: 12,
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
          authoredPosts: true,
        },
      },
    },
  });

  const artists = activeUsers
    .map((active) => {
      const user = users.find((u) => u.id === active.userId);
      if (!user) return null;
      return {
        ...user,
        recentPosts: active._count.id,
        recentLikes: active._sum.likeCount || 0,
        recentPlays: active._sum.playCount || 0,
      };
    })
    .filter(Boolean);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {artists.map(
        (artist) =>
          artist && (
            <Link
              key={artist.id}
              href={ROUTES.profile.view(artist.id)}
              className="group flex items-center gap-4 rounded-xl p-4 transition-all"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full"
                style={{ background: 'var(--accent)' }}
              >
                {artist.image ? (
                  <Image
                    src={artist.image}
                    alt={artist.name || 'Artist'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                    {(artist.name || 'A')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold" style={{ color: 'var(--text)' }}>
                  {artist.name || 'Anonymous Artist'}
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {artist._count.followers} followers
                </p>
                <div className="mt-1 flex gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{artist.recentPosts} posts this week</span>
                  {artist.recentPlays > 0 && <span>{artist.recentPlays} plays</span>}
                </div>
              </div>
            </Link>
          )
      )}
    </div>
  );
}

async function RecentAudioPosts() {
  const audioPosts = await prisma.post.findMany({
    where: {
      isDeleted: false,
      visibility: 'public',
      contentType: 'audio',
      audioUrl: { not: null },
    },
    orderBy: [{ playCount: 'desc' }, { createdAt: 'desc' }],
    take: 6,
    select: {
      id: true,
      content: true,
      genre: true,
      playCount: true,
      likeCount: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {audioPosts.map((post) => (
        <Link
          key={post.id}
          href={`/feed/post/${post.id}`}
          className="group overflow-hidden rounded-xl transition-all"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="relative aspect-video" style={{ background: 'rgba(255, 99, 71, 0.1)' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ background: 'var(--bg)' }}
              >
                <Music className="h-8 w-8" style={{ color: 'var(--accent)' }} />
              </div>
            </div>
            {post.genre && (
              <span
                className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: 'var(--bg)', color: 'var(--text)' }}
              >
                {post.genre}
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="line-clamp-2 font-medium" style={{ color: 'var(--text)' }}>
              {post.content || 'Untitled Track'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div
                className="relative h-6 w-6 overflow-hidden rounded-full"
                style={{ background: 'var(--accent)' }}
              >
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name || 'Artist'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                    {(post.author.name || 'A')[0]}
                  </div>
                )}
              </div>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                {post.author.name}
              </span>
            </div>
            <div className="mt-2 flex gap-3 text-xs" style={{ color: 'var(--muted)' }}>
              <span>{post.playCount} plays</span>
              <span>{post.likeCount} likes</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10">
        {/* Header with Logo [[memory:11700420]] */}
        <div className="border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-7xl px-4 py-8">
            {/* White RR Logo */}
            <div className="mb-6 flex justify-center">
              <Link href="/" className="group">
                <Image
                  src="/logo-dark.png"
                  alt="Rock N' Roll Basement"
                  width={120}
                  height={48}
                  className="transition-transform group-hover:scale-105"
                  priority
                />
              </Link>
            </div>
            <div className="mb-4 h-1 w-16 rounded-full" style={{ background: 'var(--accent)' }} />
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: 'rgba(255, 99, 71, 0.15)' }}
              >
                <Sparkles className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  Explore
                </h1>
                <p style={{ color: 'var(--muted)' }}>Discover what's happening in the community</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl space-y-12 px-4 py-8">
          {/* Trending Hashtags */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  Trending Hashtags
                </h2>
              </div>
              <Link
                href="/feed"
                className="flex items-center gap-1 text-sm"
                style={{ color: 'var(--accent)' }}
              >
                View feed <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense fallback={<FeedSkeleton count={3} />}>
              <TrendingHashtags />
            </Suspense>
          </section>

          {/* Trending Genres */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Music className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Popular Genres
              </h2>
            </div>
            <Suspense fallback={<TableSkeleton rows={5} columns={3} />}>
              <TrendingGenres />
            </Suspense>
          </section>

          {/* Top Audio This Week */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  Top Audio This Week
                </h2>
              </div>
              <Link
                href="/feed?type=audio"
                className="flex items-center gap-1 text-sm"
                style={{ color: 'var(--accent)' }}
              >
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense fallback={<FeedSkeleton count={2} />}>
              <RecentAudioPosts />
            </Suspense>
          </section>

          {/* Rising Artists */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Rising Artists
              </h2>
            </div>
            <Suspense fallback={<UsersSkeleton count={6} />}>
              <RisingArtists />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}
