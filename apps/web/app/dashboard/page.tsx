'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-400 font-mono text-sm uppercase tracking-widest"
        >
          Loading Session
        </motion.div>
      </div>
    );
  }

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0];

  const navigationItems = [
    {
      title: 'STUDIO',
      subtitle: 'Record & Collaborate',
      href: '/studio',
      gradient: 'from-red-900/30 to-zinc-900/50',
      border: 'border-red-800/50',
      accent: 'red-500',
      description: 'HD multi-track recording'
    },
    {
      title: 'PROJECTS',
      subtitle: 'Manage Your Music',
      href: '/projects',
      gradient: 'from-blue-900/30 to-zinc-900/50',
      border: 'border-blue-800/50',
      accent: 'blue-500',
      description: 'Albums, EPs, Singles'
    },
    {
      title: 'TOUR DATES',
      subtitle: 'Shows & Streaming',
      href: '/tours',
      gradient: 'from-purple-900/30 to-zinc-900/50',
      border: 'border-purple-800/50',
      accent: 'purple-500',
      description: 'Live performances'
    },
    {
      title: 'NETWORK',
      subtitle: 'Connect & Message',
      href: '/messages',
      gradient: 'from-green-900/30 to-zinc-900/50',
      border: 'border-green-800/50',
      accent: 'green-500',
      description: 'Real-time collaboration'
    },
  ];

  const stats = [
    { label: 'ACTIVE PROJECTS', value: '0', unit: '' },
    { label: 'TOTAL TRACKS', value: '0', unit: '' },
    { label: 'COLLABORATORS', value: '0', unit: '' },
    { label: 'THIS MONTH', value: '0', unit: '' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Studio-style Header */}
      <header className="border-b border-zinc-800 bg-black/50">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 mb-2">
                DASHBOARD
              </h1>
              <p className="font-[family-name:var(--rnrb-font-marker)] text-3xl text-white">
                {displayName}
              </p>
            </div>
            <Link 
              href="/projects/new"
              className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              NEW PROJECT
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="container mx-auto px-6 py-12">
        {/* Navigation Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {navigationItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative overflow-hidden h-48 
                  bg-gradient-to-br ${item.gradient} 
                  border ${item.border}
                  hover:border-zinc-600 transition-all duration-500
                  group cursor-pointer
                `}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                
                <div className="relative h-full p-8 flex flex-col justify-between">
                  <div>
                    <h2 className="font-mono text-2xl uppercase tracking-wider mb-1 text-white">
                      {item.title}
                    </h2>
                    <p className="text-zinc-300 text-sm uppercase tracking-widest">
                      {item.subtitle}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider">
                      {item.description}
                    </p>
                    <div className={`w-2 h-2 bg-${item.accent} rounded-full animate-pulse`} />
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 border border-white/10 scale-105 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="border border-zinc-800 bg-zinc-900/50 p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2 font-mono">
                {stat.label}
              </p>
              <p className="font-[family-name:var(--rnrb-font-marker)] text-4xl text-white">
                {stat.value}
                <span className="text-zinc-500 text-2xl">{stat.unit}</span>
              </p>
            </div>
          ))}
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border border-zinc-800 bg-zinc-900/50"
        >
          <div className="border-b border-zinc-800 p-6 bg-black/30">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400">
              RECENT ACTIVITY
            </h3>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm uppercase tracking-wider">
                No recent activity
              </p>
              <p className="text-zinc-600 text-xs mt-2">
                Start by creating your first project
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex gap-6 justify-center"
        >
          {[
            { label: 'SETTINGS', href: '/settings/profile' },
            { label: 'DISCOVER', href: '/discover' },
          ].map((link) => (
            <Link 
              key={link.label}
              href={link.href}
              className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </main>
    </div>
  );
}