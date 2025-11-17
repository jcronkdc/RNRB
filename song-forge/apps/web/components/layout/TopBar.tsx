'use client';

import React from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { cn } from '@cronkwaters/ui';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentOrg = {
    name: 'The Basement Band',
    plan: 'Pro'
  };

  const themes = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'warm', label: 'Warm', icon: Palette }
  ];

  const currentThemeIcon = themes.find(t => t.value === theme)?.icon || Moon;

  return (
    <header className="rnrb-topbar">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-surface-muted rounded-lg md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        {/* Organization switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgMenu(!showOrgMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-surface-muted rounded-lg transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-semibold">{currentOrg.name}</p>
              <p className="text-xs text-muted-foreground">{currentOrg.plan} Plan</p>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>

          {showOrgMenu && (
            <div className="absolute top-full left-0 mt-2 w-64 rnrb-card p-1 z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-surface-muted rounded-md transition-colors">
                <p className="text-sm font-medium">The Basement Band</p>
                <p className="text-xs text-muted-foreground">Pro Plan</p>
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-surface-muted rounded-md transition-colors">
                <p className="text-sm font-medium">Solo Project</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </button>
              <hr className="my-1 border-border" />
              <button className="w-full text-left px-3 py-2 hover:bg-surface-muted rounded-md transition-colors text-sm">
                Create Organization
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, songs, or people..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <div className="relative">
          <button
            onClick={() => {
              const themes = ['dark', 'light', 'warm'];
              const currentIndex = themes.indexOf(theme || 'dark');
              const nextIndex = (currentIndex + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
            className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && React.createElement(currentThemeIcon, { size: 20 })}
          </button>
        </div>

        {/* Notifications */}
        <button className="p-2 hover:bg-surface-muted rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </button>

        {/* Profile menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-surface-muted rounded-lg transition-colors"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-lg"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-accent flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {session?.user?.name?.[0] || 'U'}
                </span>
              </div>
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 rnrb-card p-1 z-50">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <hr className="my-1 border-border" />
              <button className="w-full text-left px-3 py-2 hover:bg-surface-muted rounded-md transition-colors text-sm">
                Profile Settings
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-surface-muted rounded-md transition-colors text-sm">
                Organization Settings
              </button>
              <hr className="my-1 border-border" />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-3 py-2 hover:bg-surface-muted rounded-md transition-colors text-sm text-danger"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
