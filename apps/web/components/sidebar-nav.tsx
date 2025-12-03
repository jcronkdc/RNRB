'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Sparkles,
  FolderOpen,
  Library,
  Users,
  UserSearch,
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
  Wrench,
  Share2,
  Target,
  Trophy,
  Calendar,
  Guitar,
  Heart,
  GraduationCap,
  Video,
  ShoppingBag,
  Tag,
  Palette,
  Mail,
  Bell,
} from '@/components/ui/custom-icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState, useEffect, createContext, useContext } from 'react';

import { useThemeSafe } from '@/components/theme';
import { useToast } from '@/hooks/useToast';

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
// Navigation Structure - The Musician's Journey
// ============================================

interface NavSection {
  title: string;
  description: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// Organized around THE JOURNEY, not features
const navSections: NavSection[] = [
  {
    title: 'Home',
    description: 'Your workshop',
    items: [{ label: 'Workshop', href: '/dashboard', icon: Home }],
  },
  {
    title: 'Social',
    description: 'Your community',
    items: [
      { label: 'Feed', href: '/social', icon: Sparkles },
      { label: 'Explore', href: '/social/explore', icon: Compass },
      { label: 'My Network', href: '/social/network', icon: Users },
      { label: 'Friends', href: '/social/friends', icon: Heart, badge: 'NEW' },
      { label: 'Discover', href: '/social/discover', icon: UserSearch },
      { label: 'Messages', href: '/social/messages', icon: MessageSquare },
      { label: 'Notifications', href: '/social/notifications', icon: Bell },
      { label: 'My Profile', href: '/social/profile', icon: Guitar },
    ],
  },
  {
    title: 'Create',
    description: 'Make your music',
    items: [
      { label: 'Songwriting', href: '/songwriting', icon: Music4 },
      { label: 'Sketches', href: '/create', icon: Sparkles, badge: 'BETA' },
      { label: 'Projects', href: '/projects', icon: FolderOpen },
      { label: 'RNRB Labs', href: '/labs', icon: FlaskConical },
    ],
  },
  {
    title: 'Grow',
    description: 'Develop your craft',
    items: [
      { label: 'Masterclasses', href: '/masterclasses', icon: GraduationCap, badge: 'NEW' },
      { label: 'Practice Log', href: '/tools?tool=practice-logger', icon: Target },
      { label: 'Library', href: '/library', icon: Library },
      { label: 'Toolbox', href: '/tools', icon: Wrench },
      { label: 'Studio', href: '/studio', icon: Mic2 },
    ],
  },
  {
    title: 'Connect',
    description: 'Communicate',
    items: [
      { label: 'RNRB Mail', href: '/settings/email', icon: Mail, badge: 'NEW' },
      { label: 'Meet', href: '/meet', icon: Video, badge: 'NEW' },
      { label: 'Collaborate', href: '/collaboration', icon: Users },
      { label: 'Collab Board', href: '/collaboration-needs', icon: Headphones },
    ],
  },
  {
    title: 'Perform',
    description: 'Hit the stage',
    items: [
      { label: 'Go Live', href: '/live', icon: Radio, badge: 'NEW' },
      { label: 'Shows & Tours', href: '/tours', icon: Calendar },
      { label: 'Opportunities', href: '/opportunities', icon: Compass },
      { label: 'My Website', href: '/sites', icon: Globe },
      { label: 'Share', href: '/share', icon: Share2 },
    ],
  },
  {
    title: 'Earn',
    description: 'Get paid',
    items: [
      { label: 'Revenue', href: '/revenue', icon: CreditCard },
      { label: 'My Merch', href: '/my-merch', icon: ShoppingBag, badge: 'EARN' },
      { label: 'RNRB Store', href: '/merch', icon: Tag },
    ],
  },
  {
    title: 'Marketplace',
    description: 'Buy, sell & trade gear',
    items: [
      { label: 'Browse Gear', href: '/marketplace', icon: ShoppingBag },
      { label: 'My Listings', href: '/marketplace/my-listings', icon: Tag },
      { label: 'Messages', href: '/marketplace/messages', icon: MessageSquare },
      { label: 'Saved Items', href: '/marketplace?tab=saved', icon: Heart },
    ],
  },
];

// Bottom settings items
const settingsItems: NavItem[] = [
  { label: 'Credits', href: '/credits', icon: CreditCard },
  { label: 'Theme', href: '/settings/display', icon: Palette },
  { label: 'Settings', href: '/settings', icon: Settings },
];

// ============================================
// Theme-Aware Sidebar Logo Component
// ============================================

interface SidebarLogoProps {
  isCollapsed: boolean;
  isMobile: boolean;
  isHovered: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

function SidebarLogo({
  isCollapsed,
  isMobile,
  isHovered,
  onClose,
  onToggleCollapse,
}: SidebarLogoProps) {
  const { resolvedTheme } = useThemeSafe();

  // logo-dark.png = white logo (for dark backgrounds)
  // logo-light.png = dark logo (for light backgrounds)
  const logoSrc = resolvedTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <div
      className="flex h-16 items-center justify-between px-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <Link href="/" className="flex items-center">
        <motion.img
          src={logoSrc}
          alt="Rock N' Roll Basement"
          animate={{
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-10 w-auto"
          style={{
            maxWidth: isCollapsed && !isMobile ? '40px' : '180px',
            transition: 'max-width 0.3s ease',
          }}
        />
      </Link>

      {/* Close button on mobile, collapse toggle on desktop */}
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
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--muted)' }}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

// ============================================
// Sidebar Navigation Component
// ============================================

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { isOpen: mobileMenuOpen, setIsOpen: setMobileMenuOpen } = useMobileMenu();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Home',
    'Create',
    'Grow',
    'Connect',
    'Perform',
    'Earn',
    'Marketplace',
  ]); // All sections expanded by default

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

  // Auto-expand section containing current route (only on navigation, not on manual toggle)
  useEffect(() => {
    navSections.forEach((section) => {
      const hasActiveItem = section.items.some(
        (item) =>
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]))
      );
      if (hasActiveItem) {
        setExpandedSections((prev) =>
          prev.includes(section.title) ? prev : [...prev, section.title]
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only run on pathname change, not on expandedSections change

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
      showToast('See you next time, artist.', 'success');
    } catch (error) {
      showToast('An unexpected error occurred while signing out', 'error');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } finally {
      setSigningOut(false);
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    const basePath = href.split('?')[0];
    return pathname === basePath || (basePath !== '/dashboard' && pathname.startsWith(basePath));
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
          width: isCollapsed && !isMobile ? 72 : 260,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 z-50 h-screen overflow-hidden ${!shouldShow ? 'pointer-events-none' : ''}`}
        style={{
          background: 'var(--bg)',
          borderRight: '1px solid var(--border)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Logo Section - Theme Aware */}
        <SidebarLogo
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          isHovered={isHovered}
          onClose={() => setMobileMenuOpen(false)}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Navigation Sections - Scrollable */}
        <nav
          className="overflow-y-auto px-3 py-4"
          style={{
            height: 'calc(100vh - 64px - 120px)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border) transparent',
          }}
        >
          {navSections.map((section) => {
            const isExpanded = expandedSections.includes(section.title) || isCollapsed;
            const hasActiveItem = section.items.some((item) => isActive(item.href));

            return (
              <div key={section.title} className="mb-2">
                {/* Section Header */}
                {(!isCollapsed || isMobile) && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
                  >
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{
                        color: hasActiveItem ? 'var(--accent)' : 'var(--muted)',
                      }}
                    >
                      {section.title}
                    </span>
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      style={{ color: 'var(--muted)' }}
                    />
                  </button>
                )}

                {/* Section Items */}
                <AnimatePresence initial={false}>
                  {(isExpanded || isCollapsed) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {section.items.map((item) => {
                        const active = isActive(item.href);

                        return (
                          <Link key={item.href} href={item.href}>
                            <motion.div
                              whileHover={{ x: 3 }}
                              whileTap={{ scale: 0.98 }}
                              className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 ${
                                active ? '' : 'hover:bg-white/5'
                              }`}
                              style={{
                                background: active ? 'var(--accent-glow)' : undefined,
                              }}
                            >
                              {/* Active Indicator */}
                              {active && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full"
                                  style={{ background: 'var(--accent)' }}
                                />
                              )}

                              {/* Icon */}
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200`}
                                style={{
                                  background: active ? 'var(--accent)' : 'var(--surface)',
                                }}
                              >
                                <item.icon
                                  className="h-4 w-4"
                                  style={{
                                    color: active ? 'white' : 'var(--text-secondary)',
                                  }}
                                />
                              </div>

                              {/* Label */}
                              <AnimatePresence>
                                {(!isCollapsed || isMobile) && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex flex-1 items-center justify-between"
                                  >
                                    <span
                                      className="text-sm font-medium"
                                      style={{
                                        color: active ? 'var(--text)' : 'var(--text-secondary)',
                                      }}
                                    >
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <span
                                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                        style={{
                                          background: 'var(--accent)',
                                          color: 'white',
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Settings Section */}
          <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            {settingsItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 ${
                      active ? '' : 'hover:bg-white/5'
                    }`}
                    style={{
                      background: active ? 'var(--accent-glow)' : undefined,
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: active ? 'var(--accent)' : 'var(--surface)',
                      }}
                    >
                      <item.icon
                        className="h-4 w-4"
                        style={{
                          color: active ? 'white' : 'var(--text-secondary)',
                        }}
                      />
                    </div>

                    <AnimatePresence>
                      {(!isCollapsed || isMobile) && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-medium"
                          style={{
                            color: active ? 'var(--text)' : 'var(--text-secondary)',
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 px-3 pb-4"
          style={{
            background: `linear-gradient(to top, var(--bg) 80%, transparent 100%)`,
            paddingTop: '24px',
          }}
        >
          {/* Sign Out Button */}
          <motion.button
            onClick={handleSignOut}
            disabled={signingOut}
            whileHover={{ x: signingOut ? 0 : 3 }}
            whileTap={{ scale: signingOut ? 1 : 0.98 }}
            className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:bg-red-500/20"
              style={{ background: 'var(--surface)' }}
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-400" />
              ) : (
                <LogOut className="h-4 w-4 text-red-400/70 transition-colors group-hover:text-red-400" />
              )}
            </div>

            <AnimatePresence>
              {(!isCollapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium text-red-400/70 transition-colors group-hover:text-red-400"
                >
                  {signingOut ? 'Signing Out...' : 'Sign Out'}
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
