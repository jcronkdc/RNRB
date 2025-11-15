'use client';

import { cn } from '@cronkwaters/ui';
import { motion, useReducedMotion } from 'framer-motion';
import { HeartHandshake, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ThemeToggle } from './theme/ThemeToggle';
import { Wordmark } from './Wordmark';

type NavLink = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  ariaLabel?: string;
};

const LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Why', href: '/why', ariaLabel: 'Understand why CronkWaters exists' },
  { label: 'Our Vision', href: '/vision', ariaLabel: 'Learn about CronkWaters vision and founders' },
  { label: 'Membership', href: '/membership', ariaLabel: 'View membership options' },
  { label: 'Features', href: '#features', ariaLabel: 'Explore CronkWaters features' },
  { label: 'Donate', href: '/donate', icon: HeartHandshake, ariaLabel: 'Support CronkWaters mission' }
];

const motionConfig = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' }
} as const;

export function NavBar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [currentHash, setCurrentHash] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(window.location.hash || "");
      if (window.location.hash) {
        document.body.setAttribute('data-active-hash', window.location.hash);
      } else {
        document.body.removeAttribute('data-active-hash');
      }
    };
    const onScroll = () => setScrolled(window.scrollY > 16);
    updateHash();
    onScroll();
    window.addEventListener('hashchange', updateHash);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('hashchange', updateHash);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  /* focus section heading on anchor-link click, for a11y */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'A' && t.getAttribute('href')?.startsWith('#')) {
        const id = t.getAttribute('href')!.slice(1);
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el && el.tabIndex === -1) el.focus();
        }, 0);
      }
    };
    document.body.addEventListener('click', onClick);
    return () => document.body.removeEventListener('click', onClick);
  }, []);

  const skipClasses =
    'sr-only focus:not-sr-only focus:absolute focus:z-50 focus:mx-auto focus:w-auto focus:rounded-full focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-brand-primary-foreground';

  const navClass = useMemo(
    () =>
      cn(
        'sticky top-0 z-40 w-full border-b border-border/40 backdrop-blur transition-all duration-300',
        scrolled ? 'bg-surface/95 shadow-soft' : 'bg-surface/70'
      ),
    [scrolled]
  );

  const listClass =
    'flex items-center gap-1 rounded-full border border-border/60 bg-surface/70 px-2 py-1 text-sm shadow-soft';

  return (
    <>
      <a href="#main-content" className={skipClasses}>
        Skip to content
      </a>
      <motion.nav
        className={navClass}
        {...(!prefersReducedMotion ? motionConfig : { initial: false })}
        aria-label="Primary navigation"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            aria-label="CronkWaters home"
            className="flex items-center text-brand-foreground transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Wordmark className="h-6 w-auto" />
            <span className="sr-only">CronkWaters</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className={cn(listClass, 'hidden md:flex')}>
            {LINKS.map(({ label, href, icon: Icon, ariaLabel }) => {
              const isAnchor = href.startsWith('#');
              const isActive = isAnchor
                ? currentHash === href
                : pathname === href || (href === '/' && pathname === '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-label={ariaLabel ?? label}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      isActive
                        ? 'bg-brand-primary/15 text-brand-foreground'
                        : 'text-muted-foreground hover:text-brand-foreground'
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4 opacity-80" aria-hidden="true" /> : null}
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Theme Toggle and Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-muted-foreground hover:text-brand-foreground hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/40 bg-surface/95 backdrop-blur"
          >
            <div className="px-4 py-6 space-y-3">
              {LINKS.map(({ label, href, icon: Icon, ariaLabel }) => {
                const isAnchor = href.startsWith('#');
                const isActive = isAnchor
                  ? currentHash === href
                  : pathname === href || (href === '/' && pathname === '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label={ariaLabel ?? label}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                      isActive
                        ? 'bg-brand-primary/15 text-brand-foreground font-medium'
                        : 'text-muted-foreground hover:text-brand-foreground hover:bg-surface-muted'
                    )}
                  >
                    {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
                    <span className="text-base">{label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Theme Toggle */}
              <div className="pt-3 border-t border-border/40">
                <div className="px-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
}


