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
  Radio,
  Video,
  ExternalLink,
  Globe,
  ShoppingBag,
  Mail,
} from '@/components/ui/custom-icons';
import { ThemeToggle } from '@/components/theme';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { GlobalUserSearch } from './global-user-search';
import { MobileMenuButton } from './sidebar-nav';

// Dynamic import with ssr: false to prevent hydration mismatch
// NotificationBell uses useSession() and returns null when no user exists,
// causing server/client render mismatch without this
const NotificationBell = dynamic(
  () => import('./notification-bell').then((mod) => mod.NotificationBell),
  { ssr: false }
);

export function TopBar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username?: string } | null>(null);

  // Fetch user profile to get username for public profile link
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) return;
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile({ username: data.username });
        }
      } catch {
        // Silently fail - username link just won't show
      }
    }
    fetchProfile();
  }, [session?.user]);

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
        background: 'var(--topbar-bg, rgba(30, 30, 30, 0.8))',
        borderBottom: '1px solid var(--border)',
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
            className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-all hover:bg-black/5 dark:hover:bg-white/5 lg:px-4"
            style={{ border: '1px solid var(--border)' }}
          >
            <Users className="h-4 w-4 group-hover:text-orange-400" style={{ color: 'var(--muted)' }} />
            <span className="hidden text-sm sm:inline" style={{ color: 'var(--muted)' }}>
              Find People
            </span>
            <div className="ml-2 hidden items-center gap-1 opacity-50 lg:ml-4 lg:flex" style={{ color: 'var(--muted)' }}>
              <Command className="h-3 w-3" />
              <span className="text-xs">⇧F</span>
            </div>
          </button>

          {/* Quick Create Button - Condensed on mobile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/create')}
            className="gradient-btn flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium lg:gap-2 lg:px-4"
            style={{
              background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
              boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">New</span>
            <Sparkles className="hidden h-3 w-3 lg:block" />
          </motion.button>

          {/* Go Live Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/live/go')}
            className="gradient-btn flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium lg:gap-2 lg:px-4"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            <Radio className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">Live</span>
          </motion.button>

          {/* Meet Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/meet')}
            className="gradient-btn flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium lg:gap-2 lg:px-4"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            <Video className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">Meet</span>
          </motion.button>

          {/* Sell Merch Button - NEW prominent feature */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/my-merch')}
            className="gradient-btn flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium lg:gap-2 lg:px-4"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
            title="Design and sell your own merchandise"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">Merch</span>
          </motion.button>

          {/* Email Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/mail')}
            className="gradient-btn flex items-center gap-1.5 rounded-xl px-3 py-2 font-medium lg:gap-2 lg:px-4"
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
            }}
            title="Your professional @rnrb.me email"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden text-sm sm:inline">Mail</span>
          </motion.button>
        </div>

        {/* Right Section - Theme, Credits, Notifications, Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Theme Toggle */}
          <ThemeToggle size="sm" />

          {/* Credits Display - Enhanced, hidden on very small screens */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => router.push('/credits')}
            className="group hidden items-center gap-2 rounded-xl px-3 py-2 transition-all hover:bg-white/5 sm:flex lg:px-4"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--accent-dim)',
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
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-black/5 dark:hover:bg-white/5 lg:px-3"
              style={{ border: '1px solid var(--border)' }}
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
                  <User className="h-5 w-5" style={{ color: '#ffffff' }} />
                </div>
              )}
              <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block" style={{ color: 'var(--text)' }}>
                {user?.name || user?.email?.split('@')[0] || 'Artist'}
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--muted)' }}
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
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{user?.name || 'Artist'}</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</p>
                    {creditsData && !creditsData.unlimited && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <Zap className={`h-3 w-3 ${creditsColor}`} />
                        <span className={creditsColor}>{creditsData.remaining} credits left</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    {/* View Public Profile - Only show if username is set */}
                    {userProfile?.username && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          window.open(`/u/${userProfile.username}`, '_blank');
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Globe className="h-4 w-4 text-orange-400" />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>View My Profile</span>
                        <ExternalLink className="ml-auto h-3 w-3" style={{ color: 'var(--muted)' }} />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/settings/profile');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <User className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/credits');
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <CreditCard className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Billing & Credits</span>
                    </button>

                    <div className="my-2 border-t" style={{ borderColor: 'var(--border)' }} />

                    <button
                      onClick={handleSignOut}
                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4 group-hover:text-red-400" style={{ color: 'var(--muted)' }} />
                      <span className="text-sm group-hover:text-red-400" style={{ color: 'var(--text-secondary)' }}>
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
