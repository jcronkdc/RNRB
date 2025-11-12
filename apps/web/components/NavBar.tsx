'use client';

import { cn } from '@cronkwaters/ui';
import { motion, useReducedMotion } from 'framer-motion';
import { HeartHandshake, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ThemeToggle } from './theme/ThemeToggle';

type NavLink = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  ariaLabel?: string;
};

const LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'What We Make', href: '#what-we-make' },
  { label: 'Values', href: '#values' },
  { label: 'Donate', href: '/donate', icon: HeartHandshake, ariaLabel: 'Donate to CronkWaters' },
  { label: 'Sign in', href: '/auth', icon: LogIn, ariaLabel: 'Sign in to CronkWaters' }
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
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            aria-label="CronkWaters home"
            className="flex items-center text-brand-foreground transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Wordmark className="h-6 w-auto" />
            <span className="sr-only">CronkWaters</span>
          </Link>
          <ul className={listClass}>
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
          <ThemeToggle />
        </div>
      </motion.nav>
    </>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 150 16"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <title>Song Forge wordmark</title>
      <g fill="currentColor" transform="translate(0 2)" fillRule="evenodd">
        <path d="M8 0H2C0.9 0 0 0.9 0 2v2h4c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2H0v3c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-2H6c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h4V2c0-1.1-.9-2-2-2Z" />
        <path d="M0 0h8v12H0V0Zm2 2v8h4V2H2Z" transform="translate(16)" />
        <path d="M0 0h2l6 8V0h2v12h-2l-6-8v8H0Z" transform="translate(32)" />
        <path d="M0 0h8v2H2v8h6V8H6V6h4v6c0 1.1-.9 2-2 2H0V0Z" transform="translate(48)" />
        <circle cx="60" cy="6" r="1.5" />
        <path d="M0 0h10v2H2v3h6v2H2v5H0Z" transform="translate(68)" />
        <path d="M0 0h8v12H0V0Zm2 2v8h4V2H2Z" transform="translate(84)" />
        <path d="M0 0h8c1.1 0 2 .9 2 2v3c0 1.1-.9 2-2 2H4l4 5H5.3L2 7v5H0V0Zm2 2v3h6V2H2Z" transform="translate(100)" />
        <path d="M0 0h8v2H2v8h6V8H6V6h4v6c0 1.1-.9 2-2 2H0V0Z" transform="translate(116)" />
        <path d="M0 0h10v2H2v3h6v2H2v3h8v2H0Z" transform="translate(132)" />
      </g>
    </svg>
  );
}

