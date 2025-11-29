import { prisma } from '@cronkwaters/db';
import { Loader2, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { auth } from '@/auth';
import { FeedPost } from '@/components/social-feed/FeedPost';
import { TrendingSidebar } from '@/components/social-feed/TrendingSidebar';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      content: true,
      author: {
        select: { name: true },
      },
    },
  });

  if (!post) {
    return {
      title: "Post Not Found | Rock N' Roll Basement",
    };
  }

  const truncatedContent = post.content
    ? post.content.length > 100
      ? post.content.slice(0, 100) + '...'
      : post.content
    : 'Check out this post';

  return {
    title: `${post.author.name || 'Artist'} on Rock N' Roll Basement`,
    description: truncatedContent,
    openGraph: {
      title: `${post.author.name || 'Artist'} on Rock N' Roll Basement`,
      description: truncatedContent,
    },
  };
}

async function PostDetail({ id }: { id: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  const post = await prisma.post.findUnique({
    where: { id, isDeleted: false },
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
        take: 20,
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

  if (!post) {
    notFound();
  }

  // Check visibility
  if (post.visibility === 'private' && post.userId !== userId) {
    notFound();
  }

  // Get user's reaction/bookmark status
  let userReaction = null;
  let userBookmark = null;
  let userShare = null;

  if (userId) {
    [userReaction, userBookmark, userShare] = await Promise.all([
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
  }

  const postWithUserData = {
    ...post,
    currentUserReaction: userReaction?.emoji || null,
    currentUserBookmarked: !!userBookmark,
    currentUserShared: !!userShare,
  };

  return <FeedPost post={postWithUserData} onDeleted={() => {}} onUpdated={() => {}} />;
}

async function RelatedPosts({ postId, tags }: { postId: string; tags: string[] }) {
  if (tags.length === 0) return null;

  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: postId },
      isDeleted: false,
      visibility: 'public',
      tags: { hasSome: tags },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: {
      id: true,
      content: true,
      contentType: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (relatedPosts.length === 0) return null;

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
      <h3 className="mb-4 text-lg font-semibold text-white">Related Posts</h3>
      <div className="space-y-4">
        {relatedPosts.map((related) => (
          <Link
            key={related.id}
            href={`/feed/post/${related.id}`}
            className="block rounded-lg border border-white/5 bg-white/5 p-4 transition-all hover:border-purple-500/30 hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                {related.author.image ? (
                  <img
                    src={related.author.image}
                    alt={related.author.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                    {(related.author.name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{related.author.name}</p>
                <p className="line-clamp-1 text-sm text-white/60">
                  {related.content || 'Audio post'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  // Get post tags for related posts
  const post = await prisma.post.findUnique({
    where: { id },
    select: { tags: true },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-purple-500/20 blur-[100px]" />
        <div
          className="absolute -right-32 top-1/4 h-80 w-80 animate-pulse rounded-full bg-pink-500/15 blur-[100px]"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link
              href="/feed"
              className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Feed</span>
            </Link>
            <button className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
          <div className="max-w-2xl flex-1">
            <Suspense
              fallback={
                <div className="flex items-center justify-center rounded-xl border border-white/10 bg-black/40 py-12 backdrop-blur-xl">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              }
            >
              <PostDetail id={id} />
            </Suspense>

            {/* Related Posts */}
            <Suspense fallback={null}>
              <RelatedPosts postId={id} tags={post?.tags || []} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="hidden w-80 lg:block">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
