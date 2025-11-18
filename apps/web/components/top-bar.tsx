'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Command, 
  Plus,
  Bell,
  CreditCard,
  Sparkles,
  X 
} from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './theme/ThemeToggle';

interface TopBarProps {
  credits?: number;
  maxCredits?: number;
}

export function TopBar({ credits = 150, maxCredits = 500 }: TopBarProps) {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [notifications, setNotifications] = useState(2); // Mock notification count
  
  // Command+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const creditPercentage = (credits / maxCredits) * 100;
  const isLowCredits = creditPercentage < 20;
  
  return (
    <>
      <header className="fixed top-0 right-0 left-[240px] h-[56px] bg-background border-b border-border z-30">
        <div className="h-full flex items-center justify-between px-6">
          {/* Left side - Search */}
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="
                flex items-center gap-2 px-3 py-1.5 w-full max-w-sm
                text-sm text-foreground-muted
                bg-surface rounded-md border border-border
                hover:bg-surface-hover hover:border-border-strong
                transition-all duration-200 group
              "
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search or type a command...</span>
              <kbd className="
                hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 
                text-xs rounded bg-background border border-border
                group-hover:border-border-strong
              ">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* New/Create Button */}
            <Link
              href="/create"
              className="
                btn-primary flex items-center gap-1.5
                px-3 py-1.5 text-sm
              "
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Track</span>
            </Link>
            
            {/* Credits meter */}
            <div className={`
              flex items-center gap-2 px-3 py-1.5 
              rounded-md border transition-colors duration-200
              ${isLowCredits 
                ? 'bg-error/10 border-error/30 text-error' 
                : 'bg-surface border-border text-foreground-muted'
              }
            `}>
              <CreditCard className="w-4 h-4" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{credits}</span>
                <div className="w-16 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${isLowCredits ? 'bg-error' : 'bg-brand-secondary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${creditPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
              {isLowCredits && (
                <Link 
                  href="/credits"
                  className="text-xs underline hover:no-underline"
                >
                  Upgrade
                </Link>
              )}
            </div>
            
            {/* Notifications */}
            <button className="btn-icon relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="
                  absolute -top-1 -right-1 w-5 h-5 
                  bg-brand-primary text-background
                  text-xs font-bold rounded-full 
                  flex items-center justify-center
                ">
                  {notifications}
                </span>
              )}
            </button>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Divider */}
            <div className="h-6 w-px bg-border" />
            
            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </header>
      
      {/* Command Palette (placeholder) */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowCommandPalette(false)}
          />
          <div className="relative flex items-start justify-center pt-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="
                w-full max-w-2xl bg-surface rounded-lg 
                border border-border shadow-xl overflow-hidden
              "
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search projects, tracks, or type a command..."
                  className="flex-1 bg-transparent text-foreground outline-none placeholder:text-foreground-muted"
                  autoFocus
                />
                <button
                  onClick={() => setShowCommandPalette(false)}
                  className="btn-icon w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Command palette results would go here */}
              <div className="p-4 text-center text-foreground-muted">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Command palette coming soon...</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
