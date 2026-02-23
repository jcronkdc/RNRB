'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Music2,
  FolderOpen,
  Library,
  Video,
  Calendar,
  Activity,
  Globe,
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

// ─── Mobile Menu Context ─────────────────────────────────────────────────────

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

// ─── Nav Items ───────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Songs', href: '/songwriting', icon: Music2 },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Shows', href: '/shows', icon: Calendar },
  { label: 'Library', href: '/library', icon: Library },
  { label: 'Sessions', href: '/meet', icon: Video },
  { label: 'Feed', href: '/social', icon: Activity },
  { label: 'My Site', href: '/sites', icon: Globe },
];

// ─── Sidebar Logo ────────────────────────────────────────────────────────────

function SidebarLogo({
  isCollapsed,
  isMobile,
  onClose,
  onToggle,
}: {
  isCollapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  const { resolvedTheme } = useThemeSafe();
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <div
      className="flex h-(--topbar-height) shrink-0 items-center justify-between border-b px-3"
      style={{ borderColor: 'var(--border)' }}
    >
      <Link href="/" className="flex items-center overflow-hidden">
        <img
          src={logoSrc}
          alt="RNRB"
          className="h-7 w-auto transition-all duration-200"
          style={{ maxWidth: isCollapsed && !isMobile ? '28px' : '120px' }}
        />
      </Link>

      {isMobile ? (
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/5"
          style={{ color: 'var(--muted)' }}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/5"
          style={{ color: 'var(--muted)' }}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      )}
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('sidebar-collapsed') === 'true';
    return false;
  });
  const [signingOut, setSigningOut] = useState(false);
  const { isOpen: mobileOpen, setIsOpen: setMobileOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed));
      window.dispatchEvent(new Event('sidebar-toggle'));
    }
  }, [isCollapsed]);

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

  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
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
    return pathname?.startsWith(href);
  };

  const showSidebar = !isMobile || mobileOpen;
  const collapsed = isMobile ? false : isCollapsed;
  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? 260 : sidebarWidth,
          x: showSidebar ? 0 : isMobile ? -260 : 0,
        }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r ${isMobile ? '' : ''}`}
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <SidebarLogo
          isCollapsed={collapsed}
          isMobile={isMobile}
          onClose={() => setMobileOpen(false)}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />

        {/* New Song button */}
        <div className="shrink-0 px-2.5 pt-3 pb-1">
          <button
            onClick={() => router.push('/songwriting')}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>New Song</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-150 ${
                      active ? 'bg-white/6' : 'hover:bg-white/3'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <div
                        className="absolute left-0 h-5 w-[3px] rounded-r-full"
                        style={{ background: 'var(--accent)' }}
                      />
                    )}

                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors"
                      style={{
                        color: active ? 'var(--accent)' : 'var(--muted)',
                      }}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                    </div>

                    {!collapsed && (
                      <span
                        className="truncate text-[13px] font-medium transition-colors"
                        style={{ color: active ? 'var(--text)' : 'var(--text-tertiary)' }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom — Settings & Sign Out */}
        <div className="shrink-0 border-t px-2.5 py-2.5" style={{ borderColor: 'var(--border)' }}>
          <Link href="/settings">
            <div
              className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-150 ${
                pathname?.startsWith('/settings') ? 'bg-white/6' : 'hover:bg-white/3'
              }`}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                style={{
                  color: pathname?.startsWith('/settings') ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                <Settings className="h-[18px] w-[18px]" />
              </div>
              {!collapsed && (
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  Settings
                </span>
              )}
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-150 hover:bg-white/3"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
              style={{ color: 'var(--muted)' }}
            >
              {signingOut ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <LogOut className="h-[18px] w-[18px]" />
              )}
            </div>
            {!collapsed && (
              <span className="text-[13px] font-medium" style={{ color: 'var(--muted)' }}>
                {signingOut ? 'Signing out...' : 'Sign out'}
              </span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// ─── Mobile Menu Button (used by TopBar) ─────────────────────────────────────

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
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/5"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className="flex flex-col items-center justify-center gap-[5px]">
        <span
          className={`block h-[1.5px] w-4 rounded-full transition-all duration-200 ${
            isOpen ? 'translate-y-[6.5px] rotate-45' : ''
          }`}
          style={{ background: 'var(--text)' }}
        />
        <span
          className={`block h-[1.5px] w-4 rounded-full transition-all duration-200 ${
            isOpen ? 'opacity-0' : ''
          }`}
          style={{ background: 'var(--text)' }}
        />
        <span
          className={`block h-[1.5px] w-4 rounded-full transition-all duration-200 ${
            isOpen ? '-translate-y-[6.5px] -rotate-45' : ''
          }`}
          style={{ background: 'var(--text)' }}
        />
      </div>
    </button>
  );
}
