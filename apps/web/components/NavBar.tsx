'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ThemeLogo, ThemeToggle } from './theme';
import { UserMenu } from './UserMenu';

// ─── Navigation Data ─────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/why-rnrb' },
] as const;

// Routes that use the app shell (sidebar/topbar) instead of this marketing nav
const APP_ROUTE_PREFIXES = [
  '/dashboard', '/songwriting', '/create', '/projects', '/studio', '/tours',
  '/shows', '/setlists', '/library', '/explore', '/discover', '/design',
  '/distribute', '/messages', '/notifications', '/network', '/collaboration',
  '/collaboration-needs', '/credits', '/settings', '/onboarding', '/community',
  '/sites', '/songs', '/feed', '/social', '/tools', '/meet',
  '/marketplace', '/masterclasses', '/merch', '/my-merch',
  '/opportunities', '/share', '/submit', '/revenue', '/admin',
  '/help', '/u/', '/setlist/',
];

// ─── Mobile Menu ─────────────────────────────────────────────────────────────

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
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
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <nav
        className="fixed inset-x-0 top-[56px] z-50 border-b border-(--border) md:hidden"
        style={{ background: 'var(--bg)' }}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col px-6 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="border-b border-(--border-subtle) py-3.5 text-[15px] font-medium transition-colors hover:text-(--accent)"
              style={{ color: 'var(--text)' }}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col gap-3 pt-6">
            <Link
              href="/auth"
              onClick={onClose}
              className="rounded-lg border border-(--border) px-4 py-2.5 text-center text-sm font-medium transition-colors hover:border-(--border-strong)"
              style={{ color: 'var(--text)' }}
            >
              Sign in
            </Link>
            <Link
              href="/auth?signup=true"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

// ─── NavBar ──────────────────────────────────────────────────────────────────

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAppRoute =
    pathname === '/' ||
    APP_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (isAppRoute) return;
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isAppRoute]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isAppRoute) return null;

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen ? 'nav-scrolled' : 'nav-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <ThemeLogo size="md" priority className="shrink-0" />

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                isActive(link.href)
                  ? 'text-(--text)'
                  : 'text-(--muted) hover:text-(--text)'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span
                  className="absolute -bottom-0.5 left-1/2 h-px w-4 -translate-x-1/2"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle size="sm" />
          <UserMenu />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/5 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <div className="relative h-4 w-5">
              <span
                className={`absolute left-0 block h-[1.5px] w-5 rounded-full transition-all duration-300 ${
                  mobileOpen ? 'top-[7px] rotate-45' : 'top-0'
                }`}
                style={{ backgroundColor: 'var(--text)' }}
              />
              <span
                className={`absolute left-0 top-[7px] block h-[1.5px] w-5 rounded-full transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ backgroundColor: 'var(--text)' }}
              />
              <span
                className={`absolute left-0 block h-[1.5px] w-5 rounded-full transition-all duration-300 ${
                  mobileOpen ? 'top-[7px] -rotate-45' : 'top-[14px]'
                }`}
                style={{ backgroundColor: 'var(--text)' }}
              />
            </div>
          </button>
        </div>
      </div>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
