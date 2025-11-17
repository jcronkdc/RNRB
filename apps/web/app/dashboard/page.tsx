'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Music, Radio, MessageSquare, Calendar, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="rnrb-container max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Musician'}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Your Rock N' Roll Basement command center
          </p>
        </div>

        {/* Success Message */}
        <div className="mb-8 p-6 rnrb-card bg-green-500/5 border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">You're Successfully Signed In!</h3>
              <p className="text-muted-foreground mb-3">
                Email: <span className="text-brand-primary font-mono">{user?.email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                You now have access to all platform features. Start by exploring the studio, creating your first project, or checking out the tour management tools below.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/projects/new">
            <div className="rnrb-card p-6 rnrb-hover-lift rnrb-hover-glow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg">
                  <Music className="h-8 w-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">New Project</h3>
                  <p className="text-sm text-brand-primary">Start here!</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Create the mycelium foundation - organize your songs, collaborators, and revenue
              </p>
            </div>
          </Link>

          <Link href="/studio">
            <div className="rnrb-card p-6 rnrb-hover-lift rnrb-hover-glow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg">
                  <Music className="h-8 w-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Recording Studio</h3>
                  <p className="text-sm text-muted-foreground">Start a session</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Record HD video/audio, collaborate remotely, stream to multiple platforms
              </p>
            </div>
          </Link>

          <Link href="/tours">
            <div className="rnrb-card p-6 rnrb-hover-lift rnrb-hover-glow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg">
                  <Radio className="h-8 w-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Tours & Shows</h3>
                  <p className="text-sm text-muted-foreground">Manage your tour</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Schedule shows, track tickets, stream virtual concerts
              </p>
            </div>
          </Link>

          <Link href="/messages">
            <div className="rnrb-card p-6 rnrb-hover-lift rnrb-hover-glow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Messaging</h3>
                  <p className="text-sm text-muted-foreground">Chat with your team</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time messaging, file sharing, presence awareness
              </p>
            </div>
          </Link>

          <Link href="/projects">
            <div className="rnrb-card p-6 rnrb-hover-lift rnrb-hover-glow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg">
                  <Calendar className="h-8 w-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">My Projects</h3>
                  <p className="text-sm text-muted-foreground">View all networks</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                See all your projects, songs, collaborators, and revenue
              </p>
            </div>
          </Link>

          <Link href="/analytics">
            <div className="rnrb-card p-6 rnrb-hover-lift rnrb-hover-glow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track your growth</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Revenue tracking, streaming stats, audience insights
              </p>
            </div>
          </Link>

          <Link href="/settings">
            <div className="rnrb-card p-6 rnrb-hover-lift rnrb-hover-glow cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-500/10 rounded-lg">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Settings</h3>
                  <p className="text-sm text-muted-foreground">Account & preferences</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Profile, billing, notifications, integrations
              </p>
            </div>
          </Link>
        </div>

        {/* Getting Started Guide */}
        <div className="rnrb-card p-8">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 Getting Started</h2>
          <p className="text-muted-foreground mb-6">
            You're all set up! Here's what you can do now:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <p className="font-semibold text-white mb-1">Start Recording</p>
                <p className="text-sm text-muted-foreground">
                  Go to Studio → Click "Start Recording" → Record HD video/audio or stream live
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <p className="font-semibold text-white mb-1">Create a Project</p>
                <p className="text-sm text-muted-foreground">
                  Organize your songs, demos, and collaborations in one place
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <p className="font-semibold text-white mb-1">Plan Your Tour</p>
                <p className="text-sm text-muted-foreground">
                  Add shows, manage setlists, track ticket sales
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">4️⃣</div>
              <div>
                <p className="font-semibold text-white mb-1">Invite Your Band</p>
                <p className="text-sm text-muted-foreground">
                  Collaborate in real-time with messaging and shared projects
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

