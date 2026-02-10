'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
      className="fixed left-0 right-0 top-0 z-30 h-14 lg:ml-[240px]"
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left — Mobile menu */}
        <div className="flex items-center">
          <MobileMenuButton />
        </div>

        {/* Right — Theme + Profile */}
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-white/5 lg:px-3"
              style={{ border: '1px solid var(--border)' }}
              aria-expanded={profileOpen}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="h-8 w-8 rounded-lg object-cover"
                  style={{ border: '2px solid var(--border)' }}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  <User className="h-4 w-4" />
                </div>
              )}
              <span
                className="hidden max-w-[120px] truncate text-sm font-medium sm:block"
                style={{ color: 'var(--text)' }}
              >
                {user?.name || user?.email?.split('@')[0] || 'You'}
              </span>
              <ChevronDown
                className={`hidden h-3.5 w-3.5 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--muted)' }}
              />
            </button>

            {/* Dropdown */}
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
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl"
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {user?.name || 'Musician'}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          router.push('/settings');
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-white/5"
                      >
                        <Settings className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Settings
                        </span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-red-500/10"
                      >
                        <LogOut
                          className="h-4 w-4 group-hover:text-red-400"
                          style={{ color: 'var(--muted)' }}
                        />
                        <span
                          className="text-sm group-hover:text-red-400"
                          style={{ color: 'var(--text-secondary)' }}
                        >
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
