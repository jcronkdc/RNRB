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
  Loader2,
  Globe,
  X,
  FlaskConical,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect, createContext, useContext } from 'react';

import { useToast } from '@/hooks/useToast';

// Create context for mobile menu state
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

// Export provider for use in layout
export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <MobileMenuContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

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
  { label: 'R&R Labs', href: '/labs', icon: FlaskConical, badge: 'NEW' },
  { label: 'Create Track', href: '/create', icon: Sparkles },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Studio', href: '/studio', icon: Mic2 },
  { label: 'Tours', href: '/tours', icon: Radio },
  { label: 'My Website', href: '/sites', icon: Globe, badge: 'NEW' },
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
  const { showToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { isOpen: mobileMenuOpen, setIsOpen: setMobileMenuOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Don't show sidebar on marketing pages
  const isMarketingPage =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact');

  if (isMarketingPage) return null;

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut({ callbackUrl: '/' });
      showToast('Successfully signed out', 'success');
    } catch (error) {
      showToast('An unexpected error occurred while signing out', 'error');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } finally {
      setSigningOut(false);
    }
  };

  // On mobile, only show if menu is open
  const shouldShow = !isMobile || mobileMenuOpen;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{
          x: shouldShow ? 0 : -260,
          width: isCollapsed && !isMobile ? 64 : 260,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 z-50 h-screen overflow-hidden ${!shouldShow ? 'pointer-events-none' : ''}`}
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
          <Link href="/" className="flex items-center">
            <motion.img
              src="/logo-light.png"
              alt="Rock N' Roll Basement"
              animate={{
                scale: isHovered ? 1.05 : 1,
                filter: isHovered ? 'brightness(1.2) contrast(1.05)' : 'brightness(1)',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-10 w-auto"
              style={{
                filter:
                  'drop-shadow(0 0 12px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 24px rgba(255, 99, 71, 0.3))',
                maxWidth: isCollapsed && !isMobile ? '40px' : '200px',
                transition: 'max-width 0.3s ease',
              }}
            />
          </Link>

          {/* Close button on mobile, collapse toggle on desktop */}
          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
              style={{ color: '#a8a8a8' }}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
              style={{ color: '#a8a8a8' }}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items - Scrollable with fixed height to prevent overlap */}
        <nav
          className="space-y-1 overflow-y-auto px-3 py-4"
          style={{
            height: 'calc(100vh - 64px - 140px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
        >
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

                  {/* Label - Always show on mobile, respect isCollapsed on desktop */}
                  <AnimatePresence>
                    {(!isCollapsed || isMobile) && (
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

        {/* Bottom Section - Fixed position, non-overlapping */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            background: 'linear-gradient(to top, #0a0a0a 80%, transparent 100%)',
            paddingTop: '24px',
          }}
        >
          {/* Keyboard Shortcuts Hint - Hide on mobile */}
          <AnimatePresence>
            {!isCollapsed && !isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 px-4"
              >
                <div className="rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3">
                  <p className="text-center text-xs text-muted-foreground">
                    Press{' '}
                    <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">?</kbd>{' '}
                    for shortcuts
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sign Out Button */}
          <div className="px-3 pb-4">
            <motion.button
              onClick={handleSignOut}
              disabled={signingOut}
              whileHover={{ x: signingOut ? 0 : 4 }}
              whileTap={{ scale: signingOut ? 1 : 0.98 }}
              className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 transition-all duration-200 group-hover:bg-red-500/20">
                {signingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-400" />
                ) : (
                  <LogOut className="h-5 w-5 text-gray-400 transition-colors group-hover:text-red-400" />
                )}
              </div>

              {/* Label - Always show on mobile */}
              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium text-gray-300 transition-colors group-hover:text-red-400"
                  >
                    {signingOut ? 'Signing Out...' : 'Sign Out'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// Hamburger menu button for mobile - use in TopBar
export function MobileMenuButton() {
  const { toggle, isOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <button
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/10"
      style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
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
          className="block h-0.5 w-5 bg-white"
        />
        <motion.span
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          className="block h-0.5 w-5 bg-white"
        />
        <motion.span
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -5 },
          }}
          className="block h-0.5 w-5 bg-white"
        />
      </motion.div>
    </button>
  );
}
