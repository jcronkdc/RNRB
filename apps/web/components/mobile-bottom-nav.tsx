'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Plus,
  Compass,
  MessageSquare,
  User,
  Music,
  Bell,
} from '@/components/ui/custom-icons';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Home',
    matchPaths: ['/dashboard'],
  },
  {
    href: '/discover',
    icon: Compass,
    label: 'Discover',
    matchPaths: ['/discover', '/explore', '/social'],
  },
  {
    href: '/create',
    icon: Plus,
    label: 'Create',
    matchPaths: ['/create', '/songwriting', '/studio'],
  },
  {
    href: '/messages',
    icon: MessageSquare,
    label: 'Messages',
    matchPaths: ['/messages'],
  },
  {
    href: '/settings/profile',
    icon: User,
    label: 'Profile',
    matchPaths: ['/settings', '/u/'],
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Check if current path matches nav item
  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    return item.matchPaths?.some((path) => pathname.startsWith(path)) ?? false;
  };

  return (
    <>
      {/* Bottom Navigation Bar - Only visible on mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          background: 'var(--panel)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            const isCreate = item.href === '/create';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-all ${
                  isCreate ? '' : 'min-w-[64px]'
                }`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {isCreate ? (
                  // Special Create button - larger and more prominent
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
                      boxShadow: '0 4px 16px rgba(255, 99, 71, 0.4)',
                    }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>
                ) : (
                  <>
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="mobile-nav-indicator"
                        className="absolute -top-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
                        style={{ background: 'var(--accent)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={`h-6 w-6 transition-colors ${
                        active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium transition-colors ${
                        active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// Floating Action Button for mobile - alternative to Create in bottom nav
export function MobileFab() {
  const pathname = usePathname();

  // Don't show on create pages
  if (pathname.startsWith('/create') || pathname.startsWith('/songwriting')) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-20 right-4 z-40 lg:hidden"
    >
      <Link
        href="/create"
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FF6347 0%, #FF4500 100%)',
          boxShadow: '0 4px 20px rgba(255, 99, 71, 0.5)',
        }}
        aria-label="Create new"
      >
        <Plus className="h-7 w-7 text-white" />
      </Link>
    </motion.div>
  );
}

// Mobile Quick Actions Sheet - swipe up for more actions
export function MobileQuickActions({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const actions = [
    { href: '/live/go', icon: '🎬', label: 'Go Live', color: 'bg-red-500' },
    { href: '/meet', icon: '📹', label: 'Start Meeting', color: 'bg-blue-500' },
    { href: '/my-merch', icon: '👕', label: 'Sell Merch', color: 'bg-purple-500' },
    { href: '/mail', icon: '✉️', label: 'Open Mail', color: 'bg-green-500' },
    { href: '/tools', icon: '🛠️', label: 'Tools', color: 'bg-amber-500' },
    { href: '/notifications', icon: '🔔', label: 'Notifications', color: 'bg-pink-500' },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl lg:hidden"
        style={{
          background: 'var(--panel)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-3 gap-4 px-4 pb-4">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={onClose}
              className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all active:scale-95"
              style={{ background: 'var(--bg)' }}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </>
  );
}
