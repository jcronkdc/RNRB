'use client';

import { Card } from '@cronkwaters/ui';
import { Music } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface/20 to-background px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        {/* Profile Header */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-8">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Profile Picture */}
            <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-5xl font-bold text-white">
              {username[0].toUpperCase()}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-white">@{username}</h1>
              <p className="mb-4 text-muted-foreground">
                Public profiles are currently in development. Soon you'll see:
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-sm text-purple-300">
                  🎸 Guitarist
                </div>
                <div className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
                  🎤 Vocalist
                </div>
                <div className="rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-sm text-green-300">
                  🎹 Producer
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="p-8 text-center">
          <Music className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-4 text-2xl font-semibold text-white">Public Profiles Coming Soon</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            User profiles are being built right now. Soon you'll be able to view:
          </p>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 font-medium text-white">🎵 Music Samples</p>
              <p className="text-sm text-muted-foreground">
                Listen to their tracks directly on profile
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 font-medium text-white">📊 Stats & Analytics</p>
              <p className="text-sm text-muted-foreground">
                See their streaming numbers and achievements
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 font-medium text-white">🔗 Social Links</p>
              <p className="text-sm text-muted-foreground">
                Connect on Instagram, YouTube, Twitter
              </p>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 font-medium text-white">📅 Upcoming Shows</p>
              <p className="text-sm text-muted-foreground">See their tour dates and buy tickets</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 font-medium text-white">🤝 Collaboration History</p>
              <p className="text-sm text-muted-foreground">View who they've worked with</p>
            </div>
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 font-medium text-white">💬 Send Message</p>
              <p className="text-sm text-muted-foreground">Connect and collaborate</p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/settings/profile"
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white transition hover:bg-purple-700"
            >
              Set Up Your Own Profile
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
