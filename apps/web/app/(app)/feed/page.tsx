import { Loader2, Radio, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Suspense } from 'react';

import { SocialFeed } from '@/components/social-feed/SocialFeed';

export const metadata = {
  title: "Feed | Rock N' Roll Basement",
  description: 'Discover music, connect with artists, and share your sound with the world',
};

export default function FeedPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background Orbs */}
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
        <div
          className="absolute -bottom-20 right-1/4 h-64 w-64 animate-pulse rounded-full bg-orange-500/10 blur-[100px]"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10">
        {/* Premium Hero Header */}
        <div className="border-b border-white/10 bg-gradient-to-r from-purple-900/20 via-black to-pink-900/20">
          <div className="mx-auto max-w-7xl px-4 py-12">
            {/* Gradient accent bar */}
            <div className="mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
                    <Radio className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-400">Community Hub</p>
                    <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-4xl font-bold text-transparent">
                      The Feed
                    </h1>
                  </div>
                </div>
                <p className="max-w-xl text-lg text-gray-400">
                  Where Facebook, X, and SoundCloud had a baby 🎸🔥
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-purple-400">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Trending</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-pink-400">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Following</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-orange-400">
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
                    <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/30" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    </div>
                  </div>
                  <p className="text-gray-400">Loading your feed...</p>
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
