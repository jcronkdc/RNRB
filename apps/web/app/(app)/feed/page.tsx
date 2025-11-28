import { Suspense } from 'react';
import { SocialFeed } from '@/components/social-feed/SocialFeed';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: "Feed | Rock N' Roll Basement",
  description: 'Discover music, connect with artists, and share your sound with the world',
};

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
            The Feed
          </h1>
          <p className="text-lg text-white/60">Where Facebook, X, and SoundCloud had a baby 🎸🔥</p>
        </div>

        {/* Feed */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          }
        >
          <SocialFeed />
        </Suspense>
      </div>
    </div>
  );
}
