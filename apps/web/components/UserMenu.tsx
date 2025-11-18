'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Music2, 
  CreditCard, 
  ChevronDown,
  Sparkles,
  FolderOpen
} from 'lucide-react';

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Get initial user
    supabase?.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    }) ?? { data: { subscription: { unsubscribe: () => {} } } };

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-lg animate-pulse" style={{ background: 'var(--panel)' }} />
        <div className="hidden md:block">
          <div className="h-4 w-24 rounded animate-pulse mb-1" style={{ background: 'var(--panel)' }} />
          <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--panel)' }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth"
          className="relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:scale-105 group overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            backdropFilter: 'blur(10px)'
          }}
        >
          <span className="relative z-10">Sign In</span>
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, rgba(255,99,71,0.1) 0%, rgba(255,69,0,0.05) 100%)'
            }}
          />
        </Link>
        <Link
          href="/auth?signup=true"
          className="relative px-5 py-2.5 text-sm font-semibold rounded-xl transition-all hover:scale-105 hover:shadow-2xl group overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(255, 99, 71, 0.4)'
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Get Started
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:scale-105 max-w-[200px] group"
        style={{ 
          border: '1px solid rgba(255, 99, 71, 0.2)',
          background: menuOpen 
            ? 'linear-gradient(135deg, rgba(255,99,71,0.15) 0%, rgba(255,69,0,0.1) 100%)' 
            : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          boxShadow: menuOpen ? '0 4px 16px rgba(255, 99, 71, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* User Avatar */}
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
            boxShadow: '0 2px 8px rgba(255, 99, 71, 0.3)'
          }}
        >
          {userInitial}
        </div>
        
        {/* User Info - Hidden on mobile to prevent cutoff */}
        <div className="hidden md:block text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {userName}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Signed In
          </p>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform hidden md:block ${menuOpen ? 'rotate-180' : ''}`} 
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
              className="absolute right-0 mt-2 w-72 rounded-2xl overflow-hidden z-50"
              style={{
                background: 'linear-gradient(180deg, rgba(13, 13, 13, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)',
                border: '1px solid rgba(255, 99, 71, 0.2)',
                boxShadow: '0 8px 32px rgba(255, 99, 71, 0.15), 0 0 80px rgba(255, 99, 71, 0.08)',
                backdropFilter: 'blur(20px)'
              }}
            >
              {/* User Info Header */}
              <div 
                className="p-4"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255,99,71,0.1) 0%, rgba(255,69,0,0.05) 100%)',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
                      boxShadow: '0 4px 12px rgba(255, 99, 71, 0.4)'
                    }}
                  >
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{userName}</p>
                    <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2">
                <Link
                  href="/songwriting"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/10 group-hover:bg-orange-500/20 transition-all">
                    <Music2 className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Songwriting Studio</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>AI-powered tools</p>
                  </div>
                  <Sparkles className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link
                  href="/projects"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">My Projects</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Manage your music</p>
                  </div>
                </Link>
              </div>

              {/* Menu Divider */}
              <div className="my-2" style={{ borderTop: '1px solid var(--border)' }} />

              {/* Settings Section */}
              <div className="p-2">
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--muted)' }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                <Link
                  href="/credits"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--muted)' }}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credits & Billing</span>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all w-full text-sm group"
                >
                  <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
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