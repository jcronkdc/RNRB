import { Loader2, Radio, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Suspense } from 'react';

import { SocialFeed } from '@/components/social-feed/SocialFeed';

export const metadata = {
  title: "Feed | Rock N' Roll Basement",
  description: 'Discover music, connect with artists, and share your sound with the world',
};

export default function FeedPage() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="relative z-10">
        {/* Clean Hero Header */}
        <div className="border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-7xl px-4 py-8">
            {/* Accent bar */}
            <div className="mb-4 h-1 w-16 rounded-full" style={{ background: 'var(--accent)' }} />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                  >
                    <Radio className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                      Community Hub
                    </p>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                      The Feed
                    </h1>
                  </div>
                </div>
                <p className="max-w-xl" style={{ color: 'var(--muted)' }}>
                  Where Facebook, X, and SoundCloud had a baby 🎸🔥
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3">
                <div
                  className="rounded-xl px-4 py-2"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Trending</span>
                  </div>
                </div>
                <div
                  className="rounded-xl px-4 py-2"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Following</span>
                  </div>
                </div>
                <div
                  className="rounded-xl px-4 py-2"
                  style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="flex items-center gap-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">For You</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Content */}
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="relative mx-auto mb-4 h-12 w-12">
                    <div
                      className="relative flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ background: 'rgba(255, 99, 71, 0.15)' }}
                    >
                      <Loader2
                        className="h-6 w-6 animate-spin"
                        style={{ color: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                  <p style={{ color: 'var(--muted)' }}>Loading your feed...</p>
                </div>
              </div>
            }
          >
            <SocialFeed />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
