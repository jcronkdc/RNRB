'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { LogOut, User as UserIcon, Settings, Music, Users, Search } from 'lucide-react';

export function UserMenu() {
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
      <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/auth"
          className="rnrb-button-ghost px-4 py-2 rounded-md text-sm"
        >
          Sign In
        </Link>
        <Link
          href="/auth"
          className="rnrb-button-primary px-4 py-2 rounded-md text-sm"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
          {user.email?.[0].toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">
            {user.user_metadata?.name || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-muted-foreground">Signed In</p>
        </div>
      </button>

      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-white/10">
              <p className="text-sm font-medium text-white">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {user.user_metadata?.name || 'Account Active'}
              </p>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Music className="w-4 h-4" />
                Dashboard
              </Link>
              
              <Link
                href="/settings/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                My Profile
              </Link>

              <Link
                href="/discover"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Search className="w-4 h-4" />
                Discover Musicians
              </Link>
              
              <Link
                href="/studio"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Music className="w-4 h-4" />
                Studio
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </Link>
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-white/10">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

