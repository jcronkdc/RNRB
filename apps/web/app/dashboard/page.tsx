'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Card } from '@cronkwaters/ui';
import { Music, Radio, MessageSquare, FolderOpen, TrendingUp, Settings2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0f1e] via-[#0f172a] to-[#050816]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0];

  const quickActions = [
    {
      title: 'New Project',
      description: 'Start a new album, EP, or single',
      icon: FolderOpen,
      href: '/projects/new',
      color: 'from-[#c9a961]/20 to-[#c9a961]/5',
      iconColor: 'text-[#c9a961]'
    },
    {
      title: 'Recording Studio',
      description: 'HD video sessions with collaborators',
      icon: Music,
      href: '/studio',
      color: 'from-red-500/10 to-red-500/5',
      iconColor: 'text-red-400'
    },
    {
      title: 'My Projects',
      description: 'View and manage your work',
      icon: FolderOpen,
      href: '/projects',
      color: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Tours & Shows',
      description: 'Schedule and stream performances',
      icon: Radio,
      href: '/tours',
      color: 'from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Messaging',
      description: 'Real-time collaboration',
      icon: MessageSquare,
      href: '/messages',
      color: 'from-green-500/10 to-green-500/5',
      iconColor: 'text-green-400'
    },
    {
      title: 'Settings',
      description: 'Profile and preferences',
      icon: Settings2,
      href: '/settings/profile',
      color: 'from-gray-500/10 to-gray-500/5',
      iconColor: 'text-gray-400'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] via-[#0f172a] to-[#050816] py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-3">
            Welcome back, {displayName}
          </h1>
          <p className="text-xl text-gray-400">
            Your creative command center
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {quickActions.map((action, index) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/5 bg-gradient-to-br ${action.color} group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-black/20 group-hover:bg-black/30 transition-colors`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#c9a961] transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {action.description}
                  </p>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Recent Activity</h2>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                Your recent projects and collaborations will appear here
              </p>
              <p className="text-sm text-gray-500">
                Start by creating your first project
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
