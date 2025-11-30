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
    <div
      style={{
        marginTop: '32px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--panel)',
        padding: '24px',
      }}
    >
      <h3
        style={{
          marginBottom: '16px',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'var(--text)',
        }}
      >
        Related Posts
      </h3>
      <div className="space-y-4">
        {relatedPosts.map((related) => (
          <Link
            key={related.id}
            href={`/feed/post/${related.id}`}
            style={{
              display: 'block',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              padding: '16px',
              transition: 'border-color 0.2s',
            }}
            className="hover:border-accent"
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  position: 'relative',
                  height: '40px',
                  width: '40px',
                  overflow: 'hidden',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-dim)',
                }}
              >
                {related.author.image ? (
                  <img
                    src={related.author.image}
                    alt={related.author.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      height: '100%',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      color: 'var(--text)',
                    }}
                  >
                    {(related.author.name || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p style={{ fontWeight: '500', color: 'var(--text)' }}>{related.author.name}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }} className="line-clamp-1">
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link
              href="/feed"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--muted)',
                transition: 'color 0.2s',
              }}
              className="hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Feed</span>
            </Link>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--text)',
              }}
            >
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--panel)',
                    padding: '48px',
                  }}
                >
                  <Loader2
                    style={{ height: '32px', width: '32px', color: 'var(--accent)' }}
                    className="animate-spin"
                  />
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
