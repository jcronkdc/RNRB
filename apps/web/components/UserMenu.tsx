'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut,
  ChevronDown,
  Sparkles,
  Loader2,
  LayoutDashboard,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export function UserMenu() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  const loading = status === 'loading';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      router.push('/');
    } finally {
      setSigningOut(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-lg"
        style={{ background: 'rgba(255, 255, 255, 0.1)' }}
      />
    );
  }

  // Not signed in - show auth buttons
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth"
          className="rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-white/10"
          style={{ color: 'var(--text)' }}
        >
          Sign In
        </Link>
        <Link
          href="/auth?signup=true"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
          }}
        >
          Get Started
          <Sparkles className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const userName = user.name || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:bg-white/10"
        style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <span className="max-w-[120px] truncate text-sm font-medium text-white">{userName}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/60 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
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

            {/* Simple Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl"
              style={{
                background: 'rgb(30, 30, 30)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* User Info */}
              <div
                className="border-b px-4 py-3"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <p className="truncate text-sm font-medium text-white">{userName}</p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-white/5 hover:text-white"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  {signingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {signingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
