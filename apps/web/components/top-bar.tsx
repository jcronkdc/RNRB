'use client';

import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  LogOut,
  ChevronDown,
  Settings,
} from '@/components/ui/custom-icons';
import { ThemeToggle } from '@/components/theme';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { MobileMenuButton } from './sidebar-nav';

export function TopBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/');
    }
  };

  const user = session?.user;

  return (
    <header
      className="fixed left-0 right-0 top-0 z-30 flex h-[var(--topbar-height)] items-center border-b lg:ml-[var(--sidebar-width)]"
      style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      <div className="flex h-full w-full items-center justify-between px-4 lg:px-5">
        {/* Left — Mobile menu trigger */}
        <div className="flex items-center">
          <MobileMenuButton />
        </div>

        {/* Right — Theme + Profile */}
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
              aria-expanded={profileOpen}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="h-7 w-7 rounded-md border object-cover"
                  style={{ borderColor: 'var(--border)' }}
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
              <span
                className="hidden max-w-[100px] truncate text-[13px] font-medium sm:block"
                style={{ color: 'var(--text-secondary)' }}
              >
                {user?.name || user?.email?.split('@')[0] || 'You'}
              </span>
              <ChevronDown
                className={`hidden h-3 w-3 transition-transform duration-150 sm:block ${profileOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--muted)' }}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 z-50 mt-1.5 w-48 overflow-hidden rounded-lg border"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div className="border-b px-3 py-2.5" style={{ borderColor: 'var(--border)' }}>
                      <p className="truncate text-[13px] font-medium" style={{ color: 'var(--text)' }}>
                        {user?.name || 'Musician'}
                      </p>
                      <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          router.push('/settings');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
                      >
                        <Settings className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                          Settings
                        </span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-red-500/10"
                      >
                        <LogOut className="h-3.5 w-3.5" style={{ color: 'var(--muted)' }} />
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                          Sign out
                        </span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
