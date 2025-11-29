'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';

import { UserMenu } from './UserMenu';

// ============================================================================
// Navigation Data (Single Source of Truth)
// ============================================================================

interface NavLink {
  label: string;
  href: string;
  description?: string;
}

interface NavDropdown {
  label: string;
  items: NavLink[];
}

const FEATURES: NavLink[] = [
  {
    label: 'Songwriting Studio',
    href: '/features/songwriting',
    description: 'AI-powered chord progression & lyrics',
  },
  {
    label: 'Real-Time Collaboration',
    href: '/features/collaboration',
    description: 'Video calls, screen sharing, live chat',
  },
  {
    label: 'AI Music Generation',
    href: '/features/ai-music',
    description: 'Create tracks with AI assistance',
  },
  {
    label: 'Project Management',
    href: '/features/project-management',
    description: 'Organize albums, EPs, and singles',
  },
];

const SOLUTIONS: NavLink[] = [
  {
    label: 'For Bands',
    href: '/solutions/bands',
    description: 'Collaborate across distances, tour management, smart setlists',
  },
  {
    label: 'For Songwriters',
    href: '/solutions/songwriters',
    description: 'AI-powered tools, copyright protection, find collaborators',
  },
  {
    label: 'For Studios',
    href: '/solutions/studios',
    description: 'Professional workflow, client portals, remote sessions',
  },
];

const MAIN_LINKS: NavLink[] = [
  { label: 'How It Works', href: '/#how' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/why-rnrb' },
];

// ============================================================================
// Dropdown Component (Accessible)
// ============================================================================

interface DropdownProps {
  label: string;
  items: NavLink[];
  isScrolled: boolean;
}

function Dropdown({ label, items, isScrolled }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    },
    [isOpen]
  );

  // Hover handlers with delay
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="nav-link flex items-center gap-1.5 py-2 transition-colors duration-200"
        style={{ color: isOpen ? 'var(--accent)' : undefined }}
      >
        {label}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        role="menu"
        aria-orientation="vertical"
        className={`absolute left-0 z-50 mt-2 w-72 origin-top-left rounded-xl transition-all duration-200 ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="p-2">
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-4 py-3 transition-all duration-150 hover:bg-white/5"
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {item.label}
              </p>
              {item.description && (
                <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                  {item.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Mobile Menu Component
// ============================================================================

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <nav
        className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto md:hidden"
        style={{
          background: 'var(--panel)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        }}
        aria-label="Mobile navigation"
      >
        <div className="container py-4">
          {/* Features Section */}
          <div className="mb-4">
            <p
              className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--muted)' }}
            >
              Features
            </p>
            {FEATURES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {item.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-4 border-t py-4" style={{ borderColor: 'var(--border)' }}>
            <Link
              href="/#how"
              onClick={onClose}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: 'var(--text)' }}
            >
              How It Works
            </Link>
          </div>

          {/* Solutions Section */}
          <div className="mb-4 border-t py-4" style={{ borderColor: 'var(--border)' }}>
            <p
              className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--muted)' }}
            >
              Solutions
            </p>
            {SOLUTIONS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {item.description}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* Bottom Links */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <Link
              href="/pricing"
              onClick={onClose}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: 'var(--text)' }}
            >
              Pricing
            </Link>
            <Link
              href="/why-rnrb"
              onClick={onClose}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: 'var(--text)' }}
            >
              About
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

// ============================================================================
// Main NavBar Component
// ============================================================================

export function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // App routes that should NOT show the marketing NavBar
  // These routes use the AppLayout with its own TopBar/SidebarNav
  const isAppRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/songwriting') ||
    pathname?.startsWith('/create') ||
    pathname?.startsWith('/projects') ||
    pathname?.startsWith('/studio') ||
    pathname?.startsWith('/tours') ||
    pathname?.startsWith('/shows') ||
    pathname?.startsWith('/setlists') ||
    pathname?.startsWith('/library') ||
    pathname?.startsWith('/explore') ||
    pathname?.startsWith('/messages') ||
    pathname?.startsWith('/collaboration') ||
    pathname?.startsWith('/credits') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/onboarding') ||
    pathname?.startsWith('/community');

  // Track scroll position for styling
  // NOTE: All hooks must be called before any conditional returns (React rules of hooks)
  useEffect(() => {
    if (isAppRoute) return; // Skip scroll handling for app routes
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll(); // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAppRoute]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Don't render NavBar on app routes - they have their own navigation
  // This check MUST come AFTER all hooks are called
  if (isAppRoute) {
    return null;
  }

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false; // Hash links never show active
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? 'nav-scrolled' : 'nav-transparent'
      }`}
    >
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            className="nav-logo h-10 w-auto transition-all duration-300 group-hover:brightness-110"
            width={120}
            height={40}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          <Dropdown label="Features" items={FEATURES} isScrolled={isScrolled} />

          <Link href="/#how" className={`nav-link px-4 py-2 transition-colors duration-200`}>
            How It Works
          </Link>

          <Dropdown label="Solutions" items={SOLUTIONS} isScrolled={isScrolled} />

          <Link
            href="/pricing"
            className={`nav-link px-4 py-2 transition-colors duration-200 ${
              isActive('/pricing') ? 'text-[var(--accent)]' : ''
            }`}
          >
            Pricing
          </Link>

          <Link
            href="/why-rnrb"
            className={`nav-link px-4 py-2 transition-colors duration-200 ${
              isActive('/why-rnrb') ? 'text-[var(--accent)]' : ''
            }`}
          >
            About
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <UserMenu />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/10 md:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
            {/* Animated hamburger icon */}
            <div className="relative h-5 w-6">
              <span
                className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? 'top-2.5 rotate-45' : 'top-0.5'
                }`}
                style={{ backgroundColor: 'var(--text)' }}
              />
              <span
                className={`absolute left-0 top-2.5 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ backgroundColor: 'var(--text)' }}
              />
              <span
                className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? 'top-2.5 -rotate-45' : 'top-[1.125rem]'
                }`}
                style={{ backgroundColor: 'var(--text)' }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
