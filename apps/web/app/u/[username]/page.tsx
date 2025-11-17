'use client';

import { useParams } from 'next/navigation';
import { Card } from '@cronkwaters/ui';
import { Music, Globe, Mail, Phone, Instagram, Youtube, Twitter, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] to-[#0f172a] py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* Profile Header */}
        <Card className="p-8 mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
              {username[0].toUpperCase()}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">@{username}</h1>
              <p className="text-muted-foreground mb-4">
                Public profiles are currently in development. Soon you'll see:
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300">
                  🎸 Guitarist
                </div>
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300">
                  🎤 Vocalist
                </div>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-300">
                  🎹 Producer
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="p-8 text-center">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-4">Public Profiles Coming Soon</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            User profiles are being built right now. Soon you'll be able to view:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">🎵 Music Samples</p>
              <p className="text-sm text-muted-foreground">
                Listen to their tracks directly on profile
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">📊 Stats & Analytics</p>
              <p className="text-sm text-muted-foreground">
                See their streaming numbers and achievements
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">🔗 Social Links</p>
              <p className="text-sm text-muted-foreground">
                Connect on Instagram, YouTube, Twitter
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">📅 Upcoming Shows</p>
              <p className="text-sm text-muted-foreground">
                See their tour dates and buy tickets
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">🤝 Collaboration History</p>
              <p className="text-sm text-muted-foreground">
                View who they've worked with
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-medium text-white mb-2">💬 Send Message</p>
              <p className="text-sm text-muted-foreground">
                Connect and collaborate
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link 
              href="/settings/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Set Up Your Own Profile
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

