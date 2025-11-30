'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  User,
  Users,
  Command,
  CreditCard,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

import { GlobalUserSearch } from './global-user-search';
import { MobileMenuButton } from './sidebar-nav';

// Dynamically import NotificationBell to avoid SSR issues
const NotificationBell = dynamic(
  () => import('./notification-bell').then((m) => ({ default: m.NotificationBell })),
  { ssr: false }
);

export function TopBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Fetch real credits data with caching
  const { data: creditsData } = trpc.usage.getCredits.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    enabled: !!session?.user, // Only fetch when user is authenticated
  });

  const handleSignOut = async () => {
    try {
      // Use NextAuth signOut - this handles all session cleanup
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect anyway
      router.push('/');
    }
  };

  // Determine credits display
  const creditsDisplay = creditsData?.unlimited ? '∞' : (creditsData?.remaining ?? '...');

  // Determine credits color based on remaining credits
  const creditsColor = creditsData?.unlimited
    ? 'text-purple-400' // Unlimited = purple
    : !creditsData || creditsData.remaining === undefined
      ? 'text-gray-400' // Loading or no data = gray
      : creditsData.remaining < 20
        ? 'text-red-400' // Critical = red
        : creditsData.remaining < 50
          ? 'text-orange-400' // Low = orange
          : 'text-green-400'; // Healthy = green

  const user = session?.user;

  // Keyboard shortcut to open people search (Cmd/Ctrl + Shift + F for "Find")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-30 h-14 backdrop-blur-xl lg:ml-[260px]"
      style={{
        background: 'rgba(30, 30, 30, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section - Mobile Menu + Search */}
        <div className="flex flex-1 items-center gap-2 lg:gap-4">
          {/* Mobile Menu Button */}
          <MobileMenuButton />

          {/* Search - Facebook-style people search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-all hover:bg-white/5 lg:px-4"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <Users className="h-4 w-4 text-gray-400 group-hover:text-orange-400" />
            <span className="hidden text-sm text-gray-400 group-hover:text-white sm:inline">
              Find People
            </span>
            <div className="ml-2 hidden items-center gap-1 opacity-50 lg:ml-4 lg:flex">
              <Command className="h-3 w-3" />
              <span className="text-xs">⇧F</span>
            </div>
          </button>

          {/* Quick Create Button - Condensed on mobile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/create')}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium text-white lg:gap-2 lg:px-4"
            style={{
              background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
              boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">New</span>
            <Sparkles className="hidden h-3 w-3 lg:block" />
          </motion.button>
        </div>

        {/* Right Section - Credits, Notifications, Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Credits Display - Enhanced, hidden on very small screens */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => router.push('/credits')}
            className="group hidden items-center gap-2 rounded-xl px-3 py-2 transition-all hover:bg-white/5 sm:flex lg:px-4"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 99, 71, 0.1)',
            }}
            title={
              creditsData
                ? `${creditsData.used} / ${creditsData.limit === -1 ? '∞' : creditsData.limit} used`
                : 'Loading...'
            }
          >
            <Zap className={`h-4 w-4 ${creditsColor}`} />
            <span className={`text-sm font-medium ${creditsColor}`}>{creditsDisplay}</span>
            <span className="hidden text-xs text-gray-400 lg:inline">credits</span>
          </motion.button>

          {/* Notifications - Use actual NotificationBell component */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-white/5 lg:px-3"
              style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="h-8 w-8 rounded-lg"
                  style={{ border: '2px solid rgba(255, 99, 71, 0.5)' }}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
                    border: '2px solid rgba(255, 99, 71, 0.5)',
                  }}
                >
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-white sm:block">
                {user?.name || user?.email?.split('@')[0] || 'Artist'}
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 text-gray-400 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl"
                  style={{
                    background: 'rgba(30, 30, 30, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="border-b p-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p className="text-sm font-medium text-white">{user?.name || 'Artist'}</p>
                    <p className="mt-1 text-xs text-gray-400">{user?.email}</p>
                    {creditsData && !creditsData.unlimited && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <Zap className={`h-3 w-3 ${creditsColor}`} />
                        <span className={creditsColor}>{creditsData.remaining} credits left</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/settings');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-white/5"
                    >
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/credits');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-white/5"
                    >
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Billing & Credits</span>
                    </button>

                    <div
                      className="my-2 border-t"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    />

                    <button
                      onClick={handleSignOut}
                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-400" />
                      <span className="text-sm text-gray-300 group-hover:text-red-400">
                        Sign Out
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Global User Search Modal */}
      <GlobalUserSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
