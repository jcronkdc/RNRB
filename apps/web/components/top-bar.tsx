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
  Music
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
    await supabase?.auth.signOut();
    router.push('/');
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 h-14 z-30 backdrop-blur-xl"
      style={{
        background: 'rgba(30, 30, 30, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginLeft: '260px'
      }}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-all group"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-white" />
            <span className="text-sm text-gray-400 group-hover:text-white">Search</span>
            <div className="flex items-center gap-1 ml-8 opacity-50">
              <Command className="w-3 h-3" />
              <span className="text-xs">K</span>
            </div>
          </button>

          {/* Quick Create Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
            style={{
              background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
              boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New</span>
            <Sparkles className="w-3 h-3" />
          </motion.button>
        </div>

        {/* Right Section - Credits, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Credits Display */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => router.push('/credits')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/5 transition-all group"
            style={{ 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 99, 71, 0.1)'
            }}
          >
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">{credits}</span>
            <span className="text-xs text-gray-400">credits</span>
          </motion.button>

          {/* Notifications */}
          <button
            className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all"
            style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {notifications > 0 && (
              <span 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
              style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-lg"
                  style={{ border: '2px solid rgba(255, 99, 71, 0.5)' }}
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
                    border: '2px solid rgba(255, 99, 71, 0.5)'
                  }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-white max-w-[120px] truncate">
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Artist'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(30, 30, 30, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p className="text-sm font-medium text-white">
                      {user?.user_metadata?.name || 'Artist'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {user?.email}
                    </p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push('/credits');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left"
                    >
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Billing & Credits</span>
                    </button>

                    <div className="my-2 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all text-left group"
                    >
                      <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                      <span className="text-sm text-gray-300 group-hover:text-red-400">Sign Out</span>
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
              className="w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(30, 30, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-6 h-6 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search projects, tracks, collaborators..."
                    className="flex-1 bg-transparent text-lg text-white placeholder-gray-400 outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-3">Quick Actions</p>
                  {[
                    { icon: Sparkles, label: 'Create New Track', shortcut: '⌘N' },
                    { icon: Music, label: 'Browse Library', shortcut: '⌘L' },
                    { icon: User, label: 'View Profile', shortcut: '⌘P' }
                  ].map((action, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="w-5 h-5 text-gray-400" />
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