'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Bell,
  User,
  Command,
  CreditCard,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  Music,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [credits, setCredits] = useState(150); // Mock credits
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notifications

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        console.error('Supabase not initialized - cannot sign out');
        // Force redirect to home page anyway
        router.push('/');
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        // Still redirect even if there's an error
      }

      // Clear any local storage/session data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token');
        window.sessionStorage.clear();
      }

      router.push('/');
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Force redirect anyway
      router.push('/');
    }
  };

  return (
    <header
      className="fixed left-0 right-0 top-0 z-30 h-14 backdrop-blur-xl"
      style={{
        background: 'rgba(30, 30, 30, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginLeft: '260px',
      }}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section - Search */}
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="group flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <Search className="h-4 w-4 text-gray-400 group-hover:text-white" />
            <span className="text-sm text-gray-400 group-hover:text-white">Search</span>
            <div className="ml-8 flex items-center gap-1 opacity-50">
              <Command className="h-3 w-3" />
              <span className="text-xs">K</span>
            </div>
          </button>

          {/* Quick Create Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
              boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)',
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">New</span>
            <Sparkles className="h-3 w-3" />
          </motion.button>
        </div>

        {/* Right Section - Credits, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Credits Display */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => router.push('/credits')}
            className="group flex items-center gap-2 rounded-xl px-4 py-2 transition-all hover:bg-white/5"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 99, 71, 0.1)',
            }}
          >
            <Zap className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-white">{credits}</span>
            <span className="text-xs text-gray-400">credits</span>
          </motion.button>

          {/* Notifications */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <Bell className="h-5 w-5 text-gray-400" />
            {notifications > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: '#FF6347' }}
              >
                {notifications}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
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
              <span className="max-w-[120px] truncate text-sm font-medium text-white">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artist'}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
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
                    <p className="text-sm font-medium text-white">
                      {user?.user_metadata?.name || 'Artist'}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{user?.email}</p>
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

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-32"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-hidden rounded-2xl"
              style={{
                background: 'rgba(30, 30, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Search className="h-6 w-6 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search projects, tracks, collaborators..."
                    className="flex-1 bg-transparent text-lg text-white placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <p className="mb-3 text-xs font-medium uppercase text-gray-500">Quick Actions</p>
                  {[
                    { icon: Sparkles, label: 'Create New Track', shortcut: '⌘N' },
                    { icon: Music, label: 'Browse Library', shortcut: '⌘L' },
                    { icon: User, label: 'View Profile', shortcut: '⌘P' },
                  ].map((action, index) => (
                    <button
                      key={index}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-300">{action.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{action.shortcut}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          header {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </header>
  );
}
