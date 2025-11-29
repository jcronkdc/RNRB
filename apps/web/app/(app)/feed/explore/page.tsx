import { Suspense } from 'react';
import { Loader2, Hash, TrendingUp, Music, Users, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@cronkwaters/db';

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
          className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-black/40 to-pink-500/10 p-4 backdrop-blur-xl transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <div className="absolute right-2 top-2 text-3xl font-bold text-white/5">{index + 1}</div>
          <Hash className="mb-2 h-5 w-5 text-purple-400" />
          <p className="font-semibold text-white group-hover:text-purple-300">{tag.name}</p>
          <p className="mt-1 text-sm text-white/50">
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
            className="group flex items-center gap-3 rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/10 to-orange-500/10 px-5 py-3 transition-all hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10"
          >
            <Music className="h-5 w-5 text-pink-400" />
            <span className="font-semibold text-white group-hover:text-pink-300">
              {genre.genre}
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
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
              href={`/profile/${artist.id}`}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl transition-all hover:border-purple-500/30 hover:bg-black/60"
            >
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
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
                <p className="truncate font-semibold text-white group-hover:text-purple-300">
                  {artist.name || 'Anonymous Artist'}
                </p>
                <p className="text-sm text-white/50">{artist._count.followers} followers</p>
                <div className="mt-1 flex gap-3 text-xs text-white/40">
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
          className="group overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:border-purple-500/30"
        >
          <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                <Music className="h-8 w-8 text-white" />
              </div>
            </div>
            {post.genre && (
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {post.genre}
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="line-clamp-2 font-medium text-white group-hover:text-purple-300">
              {post.content || 'Untitled Track'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
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
              <span className="text-sm text-white/60">{post.author.name}</span>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-white/40">
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
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-purple-500/20 blur-[100px]" />
        <div
          className="absolute -right-32 top-1/4 h-80 w-80 animate-pulse rounded-full bg-pink-500/15 blur-[100px]"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-[100px]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-purple-900/20 via-black to-pink-900/20">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-4xl font-bold text-transparent">
                  Explore
                </h1>
                <p className="text-lg text-gray-400">
                  Discover trending hashtags, genres, and rising artists
                </p>
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
                <Hash className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Trending Hashtags</h2>
              </div>
              <Link
                href="/feed"
                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
              >
                View feed <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              }
            >
              <TrendingHashtags />
            </Suspense>
          </section>

          {/* Trending Genres */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Music className="h-6 w-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Popular Genres</h2>
            </div>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
                </div>
              }
            >
              <TrendingGenres />
            </Suspense>
          </section>

          {/* Top Audio This Week */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-orange-400" />
                <h2 className="text-2xl font-bold text-white">Top Audio This Week</h2>
              </div>
              <Link
                href="/feed?type=audio"
                className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
              >
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              }
            >
              <RecentAudioPosts />
            </Suspense>
          </section>

          {/* Rising Artists */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Rising Artists</h2>
            </div>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              }
            >
              <RisingArtists />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}
