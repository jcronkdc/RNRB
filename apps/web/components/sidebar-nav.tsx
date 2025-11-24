'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Sparkles,
  FolderOpen,
  Library,
  Users,
  Compass,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Music4,
  Mic2,
  Radio,
  Headphones,
  MessageSquare,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  divider?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Collaboration', href: '/collaboration', icon: Users, badge: 'LIVE' },
  { label: 'Songwriting', href: '/songwriting', icon: Music4, badge: 'AI' },
  { label: 'Create Track', href: '/create', icon: Sparkles },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Studio', href: '/studio', icon: Mic2 },
  { label: 'Tours', href: '/tours', icon: Radio },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'Library', href: '/library', icon: Library },
  { divider: true, label: '', href: '', icon: Home },
  { label: 'Credits', href: '/credits', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: Settings },
];

// Music-themed icons for visual interest
const floatingIcons = [Music4, Mic2, Radio, Headphones];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Don't show sidebar on marketing pages
  const isMarketingPage =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact');

  if (isMarketingPage) return null;

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        console.error('Supabase not initialized - cannot sign out');
        router.push('/');
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
      }

      // Clear any local storage/session data
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token');
        window.sessionStorage.clear();
      }

      router.push('/');
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      router.push('/');
    }
  };

  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{
        x: 0,
        width: isCollapsed ? 64 : 260,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-0 top-0 z-40 h-screen"
      style={{
        background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Logo Section */}
      <div
        className="flex h-16 items-center justify-between px-4"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <Link href="/dashboard" className="flex items-center">
          <motion.img
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            animate={{
              scale: isHovered ? 1.05 : 1,
              filter: isHovered ? 'brightness(1.3) contrast(1.1)' : 'brightness(1.1)',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-10 w-auto"
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3))',
              maxWidth: isCollapsed ? '40px' : '200px',
              transition: 'max-width 0.3s ease',
            }}
          />
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ color: '#a8a8a8' }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 px-3 py-6">
        {navItems.map((item, index) => {
          if (item.divider) {
            return (
              <div
                key={index}
                className="my-4 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              />
            );
          }

          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20' : 'hover:bg-white/5'} `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #FF6347 0%, #FF4500 100%)' }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? 'bg-gradient-to-br from-orange-500/30 to-red-500/30'
                      : 'bg-white/5 group-hover:bg-white/10'
                  } transition-all duration-200`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}
                  />
                </div>

                {/* Label */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-1 items-center justify-between"
                    >
                      <span
                        className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'} transition-colors`}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
                            color: 'white',
                            fontSize: '10px',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Floating Music Icons (subtle animation) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {floatingIcons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute opacity-5"
            initial={{
              x: Math.random() * 200,
              y: Math.random() * 600,
              scale: 0,
            }}
            animate={{
              y: [null, -20, 20, -20],
              scale: 1,
            }}
            transition={{
              y: {
                repeat: Infinity,
                duration: 6 + index * 2,
                ease: 'easeInOut',
              },
              scale: {
                duration: 0.5,
                delay: index * 0.2,
              },
            }}
          >
            <Icon className="h-16 w-16 text-white" />
          </motion.div>
        ))}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-auto absolute bottom-20 left-0 right-0 px-4"
          >
            <div className="rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3">
              <p className="text-muted-foreground text-center text-xs">
                Press{' '}
                <kbd className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">?</kbd> for
                shortcuts
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Out Button at Bottom */}
      <div className="pointer-events-auto absolute bottom-4 left-0 right-0 px-3">
        <motion.button
          onClick={handleSignOut}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-red-500/10"
        >
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-all duration-200 group-hover:bg-red-500/20">
            <LogOut className="h-5 w-5 text-gray-400 transition-colors group-hover:text-red-400" />
          </div>

          {/* Label */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-sm font-medium text-gray-300 transition-colors group-hover:text-red-400"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
