'use client';

import { type User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Settings,
  Music2,
  CreditCard,
  ChevronDown,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';


export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if Supabase is initialized
    if (!supabase) {
      console.warn('Supabase client not initialized in UserMenu');
      setLoading(false);
      return;
    }

    // Get initial user
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error getting user:', err);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!supabase) {
      console.error('Cannot sign out - Supabase not initialized');
      window.location.href = '/';
      return;
    }
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 animate-pulse rounded-lg"
          style={{ background: 'var(--panel)' }}
        />
        <div className="hidden md:block">
          <div
            className="mb-1 h-4 w-24 animate-pulse rounded"
            style={{ background: 'var(--panel)' }}
          />
          <div className="h-3 w-16 animate-pulse rounded" style={{ background: 'var(--panel)' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth"
          className="group relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span className="relative z-10">Sign In</span>
          <div
            className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,99,71,0.1) 0%, rgba(255,69,0,0.05) 100%)',
            }}
          />
        </Link>
        <Link
          href="/auth?signup=true"
          className="group relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105 hover:shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(255, 99, 71, 0.4)',
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Get Started
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div
            className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
            }}
          />
        </Link>
      </div>
    );
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const userInitial = userName[0].toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="group flex max-w-[200px] items-center gap-2 rounded-xl px-3 py-2 transition-all hover:scale-105"
        style={{
          border: '1px solid rgba(255, 99, 71, 0.2)',
          background: menuOpen
            ? 'linear-gradient(135deg, rgba(255,99,71,0.15) 0%, rgba(255,69,0,0.1) 100%)'
            : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          boxShadow: menuOpen
            ? '0 4px 16px rgba(255, 99, 71, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* User Avatar */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
            boxShadow: '0 2px 8px rgba(255, 99, 71, 0.3)',
          }}
        >
          {userInitial}
        </div>

        {/* User Info - Hidden on mobile to prevent cutoff */}
        <div className="hidden min-w-0 text-left md:block">
          <p className="truncate text-sm font-medium text-white">{userName}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Signed In
          </p>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`hidden h-4 w-4 text-gray-400 transition-transform md:block ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl"
              style={{
                background:
                  'linear-gradient(180deg, rgba(13, 13, 13, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
                border: '1px solid rgba(255, 99, 71, 0.2)',
                boxShadow: '0 8px 32px rgba(255, 99, 71, 0.15), 0 0 80px rgba(255, 99, 71, 0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* User Info Header */}
              <div
                className="p-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,99,71,0.1) 0%, rgba(255,69,0,0.05) 100%)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
                      boxShadow: '0 4px 12px rgba(255, 99, 71, 0.4)',
                    }}
                  >
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{userName}</p>
                    <p className="truncate text-sm" style={{ color: 'var(--muted)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2">
                <Link
                  href="/songwriting"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 transition-all group-hover:bg-orange-500/20">
                    <Music2 className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Songwriting Studio</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      AI-powered tools
                    </p>
                  </div>
                  <Sparkles className="h-3 w-3 text-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>

                <Link
                  href="/projects"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 transition-all group-hover:bg-blue-500/20">
                    <FolderOpen className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">My Projects</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Manage your music
                    </p>
                  </div>
                </Link>
              </div>

              {/* Menu Divider */}
              <div className="my-2" style={{ borderTop: '1px solid var(--border)' }} />

              {/* Settings Section */}
              <div className="p-2">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--muted)' }}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>

                <Link
                  href="/credits"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--muted)' }}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Credits & Billing</span>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleSignOut}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                  <span className="text-red-400 group-hover:text-red-300">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
