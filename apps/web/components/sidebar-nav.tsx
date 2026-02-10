'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Music2,
  FolderOpen,
  Library,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  X,
  Plus,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect, createContext, useContext } from 'react';

import { useThemeSafe } from '@/components/theme';

// ============================================
// Mobile Menu Context
// ============================================

interface MobileMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType>({
  isOpen: false,
  setIsOpen: () => {},
  toggle: () => {},
});

export const useMobileMenu = () => useContext(MobileMenuContext);

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <MobileMenuContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

// ============================================
// Navigation — focused, minimal, soulful
// ============================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
    description: 'Your workspace',
  },
  {
    label: 'Songs',
    href: '/songwriting',
    icon: Music2,
    description: 'Write & create',
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    description: 'Collaborate',
  },
  {
    label: 'Library',
    href: '/library',
    icon: Library,
    description: 'Your files',
  },
  {
    label: 'Sessions',
    href: '/meet',
    icon: Video,
    description: 'Meet & play',
  },
];

// ============================================
// Theme-Aware Sidebar Logo
// ============================================

function SidebarLogo({
  isCollapsed,
  isMobile,
  onClose,
  onToggleCollapse,
}: {
  isCollapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  const { resolvedTheme } = useThemeSafe();
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <div
      className="flex h-16 items-center justify-between px-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <Link href="/" className="flex items-center">
        <img
          src={logoSrc}
          alt="Rock N' Roll Basement"
          width={96}
          height={40}
          className="h-10 w-auto"
          style={{
            maxWidth: isCollapsed && !isMobile ? '40px' : '160px',
            transition: 'max-width 0.3s ease',
          }}
        />
      </Link>

      {isMobile ? (
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}

// ============================================
// Sidebar Navigation
// ============================================

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved === 'true';
    }
    return false;
  });
  const [signingOut, setSigningOut] = useState(false);
  const { isOpen: mobileMenuOpen, setIsOpen: setMobileMenuOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Persist collapsed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
      window.dispatchEvent(new Event('sidebar-toggle'));
    }
  }, [isCollapsed]);

  // Keyboard shortcut: Cmd+B to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (!isMobile) setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  // Close mobile menu on navigation
  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
      setSigningOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const showSidebar = !isMobile || mobileMenuOpen;
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? 280 : effectiveCollapsed ? 72 : 240,
          x: showSidebar ? 0 : isMobile ? -280 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col ${
          isMobile ? '' : 'relative'
        }`}
        style={{
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <SidebarLogo
          isCollapsed={effectiveCollapsed}
          isMobile={isMobile}
          onClose={() => setMobileMenuOpen(false)}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Quick create button */}
        <div className="px-3 pt-4 pb-2">
          <motion.button
            onClick={() => router.push('/songwriting')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-all"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="h-4 w-4" />
            {!effectiveCollapsed && <span>New Song</span>}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      active ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                      style={{
                        background: active ? 'var(--accent)' : 'var(--surface)',
                        color: active ? 'white' : 'var(--muted)',
                      }}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                    </div>

                    <AnimatePresence>
                      {!effectiveCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.15 }}
                          className="min-w-0 flex-1"
                        >
                          <span
                            className="block text-sm font-medium"
                            style={{
                              color: active ? 'var(--text)' : 'var(--text-secondary)',
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            className="block text-xs"
                            style={{ color: 'var(--muted)' }}
                          >
                            {item.description}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div
          className="space-y-1 px-3 pb-4 pt-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* Settings */}
          <Link href="/settings">
            <motion.div
              whileHover={{ x: 2 }}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                pathname.startsWith('/settings') ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: pathname.startsWith('/settings')
                    ? 'var(--accent)'
                    : 'var(--surface)',
                  color: pathname.startsWith('/settings') ? 'white' : 'var(--muted)',
                }}
              >
                <Settings className="h-[18px] w-[18px]" />
              </div>
              <AnimatePresence>
                {!effectiveCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {/* Sign out */}
          <motion.button
            onClick={handleSignOut}
            disabled={signingOut}
            whileHover={{ x: 2 }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'var(--surface)', color: 'var(--muted)' }}
            >
              {signingOut ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <LogOut className="h-[18px] w-[18px]" />
              )}
            </div>
            <AnimatePresence>
              {!effectiveCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-sm font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}

// ============================================
// Mobile Menu Button
// ============================================

export function MobileMenuButton() {
  const { toggle, isOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isMobile) return null;

  return (
    <button
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
      style={{ border: '1px solid var(--border)' }}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <motion.div
        animate={isOpen ? 'open' : 'closed'}
        className="flex flex-col items-center justify-center gap-1"
      >
        <motion.span
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 5 },
          }}
          className="block h-0.5 w-5"
          style={{ background: 'var(--text)' }}
        />
        <motion.span
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          className="block h-0.5 w-5"
          style={{ background: 'var(--text)' }}
        />
        <motion.span
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -5 },
          }}
          className="block h-0.5 w-5"
          style={{ background: 'var(--text)' }}
        />
      </motion.div>
    </button>
  );
}
