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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-zinc-600 font-mono text-sm uppercase tracking-widest"
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
      gradient: 'from-red-950/20 to-black',
      border: 'border-red-900/20',
      accent: 'red-600',
      description: 'HD multi-track recording'
    },
    {
      title: 'PROJECTS',
      subtitle: 'Manage Your Music',
      href: '/projects',
      gradient: 'from-blue-950/20 to-black',
      border: 'border-blue-900/20',
      accent: 'blue-600',
      description: 'Albums, EPs, Singles'
    },
    {
      title: 'TOUR DATES',
      subtitle: 'Shows & Streaming',
      href: '/tours',
      gradient: 'from-purple-950/20 to-black',
      border: 'border-purple-900/20',
      accent: 'purple-600',
      description: 'Live performances'
    },
    {
      title: 'NETWORK',
      subtitle: 'Connect & Message',
      href: '/messages',
      gradient: 'from-green-950/20 to-black',
      border: 'border-green-900/20',
      accent: 'green-600',
      description: 'Real-time collaboration'
    },
  ];

  const stats = [
    { label: 'ACTIVE PROJECTS', value: '03', unit: '' },
    { label: 'TOTAL TRACKS', value: '48', unit: '' },
    { label: 'COLLABORATORS', value: '12', unit: '' },
    { label: 'THIS MONTH', value: '4.3', unit: 'K' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Studio-style Header */}
      <header className="border-b border-zinc-900">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-2">
                DASHBOARD
              </h1>
              <p className="font-[family-name:var(--rnrb-font-marker)] text-3xl">
                {displayName}
              </p>
            </div>
            <Link 
              href="/projects/new"
              className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
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
                  hover:border-zinc-700 transition-all duration-500
                  group cursor-pointer
                `}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                
                <div className="relative h-full p-8 flex flex-col justify-between">
                  <div>
                    <h2 className="font-mono text-2xl uppercase tracking-wider mb-1">
                      {item.title}
                    </h2>
                    <p className="text-zinc-400 text-sm uppercase tracking-widest">
                      {item.subtitle}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">
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
            <div key={stat.label} className="border border-zinc-900 p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2 font-mono">
                {stat.label}
              </p>
              <p className="font-[family-name:var(--rnrb-font-marker)] text-4xl">
                {stat.value}
                <span className="text-zinc-600 text-2xl">{stat.unit}</span>
              </p>
            </div>
          ))}
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="border border-zinc-900"
        >
          <div className="border-b border-zinc-900 p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
              RECENT ACTIVITY
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {[
                { time: '2 HOURS AGO', action: 'RECORDING SESSION', project: 'Summer Sessions', status: 'COMPLETED' },
                { time: '5 HOURS AGO', action: 'NEW COLLABORATOR', project: 'Rock Anthem EP', status: 'JOHN SMITH JOINED' },
                { time: '1 DAY AGO', action: 'ROYALTY PAYMENT', project: 'Streaming Revenue', status: '$125.00' },
              ].map((activity, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between py-3 border-b border-zinc-900/50 last:border-0"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-zinc-600 font-mono text-xs uppercase tracking-wider">
                      {activity.time}
                    </span>
                    <div>
                      <p className="text-sm uppercase tracking-wider">
                        {activity.action}
                      </p>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">
                        {activity.project}
                      </p>
                    </div>
                  </div>
                  <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">
                    {activity.status}
                  </span>
                </motion.div>
              ))}
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
            { label: 'HELP', href: '/help' },
            { label: 'LOGOUT', href: '/logout' },
          ].map((link) => (
            <Link 
              key={link.label}
              href={link.href}
              className="text-zinc-600 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      </main>
    </div>
  );
}