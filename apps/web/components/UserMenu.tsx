'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Settings,
  Music2,
  CreditCard,
  ChevronDown,
  Sparkles,
  FolderOpen,
  Loader2,
  Zap,
  LayoutDashboard,
  Bell,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '@/hooks/useToast';
import { trpc } from '@cronkwaters/trpc/client/react';

export function UserMenu() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const loading = status === 'loading';

  // Fetch credits data
  const { data: creditsData } = trpc.usage.getCredits.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 60000,
  });

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut({ callbackUrl: '/' });
      showToast('Successfully signed out', 'success');
    } catch (error) {
      showToast('An unexpected error occurred while signing out', 'error');
      // Force redirect anyway after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } finally {
      setSigningOut(false);
    }
  };

  // Show loading skeleton while fetching user data
  // This renders consistently on both server and client (loading = true initially)
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

  const userName = user.name || user.email?.split('@')[0] || 'User';
  const userInitial = userName[0].toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="group flex max-w-[240px] items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all hover:scale-[1.02]"
        style={{
          border: '1px solid rgba(255, 99, 71, 0.25)',
          background: menuOpen
            ? 'linear-gradient(135deg, rgba(255,99,71,0.2) 0%, rgba(255,69,0,0.15) 100%)'
            : 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(12px)',
          boxShadow: menuOpen
            ? '0 4px 20px rgba(255, 99, 71, 0.3)'
            : '0 2px 12px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* User Avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-bold text-white shadow-md"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
          }}
        >
          {userInitial}
        </div>

        {/* User Info */}
        <div className="hidden min-w-0 flex-1 text-left sm:block">
          <p className="truncate text-sm font-semibold leading-tight text-white">{userName}</p>
          <p className="text-[11px] leading-tight" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Signed In
          </p>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown
          className={`hidden h-4 w-4 shrink-0 text-white/70 transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`}
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
                  href="/dashboard"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 transition-all group-hover:bg-indigo-500/20">
                    <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Dashboard</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Your central hub
                    </p>
                  </div>
                </Link>

                <Link
                  href="/dashboard"
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 transition-all group-hover:bg-purple-500/20">
                    <Bell className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Notifications</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Stay updated
                    </p>
                  </div>
                </Link>

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
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/5"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--muted)' }}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4" />
                    <span>Credits & Billing</span>
                  </div>
                  {creditsData && (
                    <div className="flex items-center gap-1">
                      <Zap
                        className={`h-3 w-3 ${
                          creditsData.unlimited
                            ? 'text-green-400'
                            : creditsData.remaining < 20
                              ? 'text-red-400'
                              : creditsData.remaining < 50
                                ? 'text-orange-400'
                                : 'text-green-400'
                        }`}
                      />
                      <span className="text-xs font-medium">
                        {creditsData.unlimited ? '∞' : creditsData.remaining}
                      </span>
                    </div>
                  )}
                </Link>
              </div>

              {/* Sign Out */}
              <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {signingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                  ) : (
                    <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                  )}
                  <span className="text-red-400 group-hover:text-red-300">
                    {signingOut ? 'Signing Out...' : 'Sign Out'}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
