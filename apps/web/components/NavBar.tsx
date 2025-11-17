'use client';

import { cn } from '@cronkwaters/ui';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X, ChevronDown, Search, Command } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// import { ThemeToggle } from './theme/ThemeToggle';

type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
};

const LINKS: NavLink[] = [
  { label: 'Features', href: '/why-rnrb' },
  { label: 'Platform', href: '#', children: [
    { label: 'Studio & Recording', href: '/studio' },
    { label: 'Live Streaming & Tours', href: '/tours' },
    { label: 'Real-Time Messaging', href: '/messages' },
    { label: 'Recording Guide', href: '/studio/recording-guide' },
  ]},
  { label: 'Pricing', href: '/pricing' },
  { label: 'Why RNRB', href: '/why-rnrb' },
];

export function NavBar() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const NavItem = ({ link }: { link: NavLink }) => {
    const hasChildren = link.children && link.children.length > 0;
    const isDropdownActive = activeDropdown === link.label;

    return (
      <div
        className="relative"
        onMouseEnter={() => hasChildren && setActiveDropdown(link.label)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <Link
          href={link.href}
          className={cn(
            "rnrb-nav-item flex items-center gap-1",
            isActive(link.href) && "active"
          )}
        >
          {link.label}
          {hasChildren && (
            <ChevronDown 
              className={cn(
                "w-3 h-3 transition-transform",
                isDropdownActive && "rotate-180"
              )}
            />
          )}
        </Link>
        
        {hasChildren && (
          <motion.div
            initial={false}
            animate={{
              opacity: isDropdownActive ? 1 : 0,
              y: isDropdownActive ? 0 : -10,
              pointerEvents: isDropdownActive ? 'auto' : 'none'
            }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-48 rnrb-card p-2 shadow-xl"
          >
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-3 py-2 text-sm rounded-md",
                  "text-muted-foreground hover:text-foreground hover:bg-surface",
                  "transition-colors duration-200",
                  isActive(child.href) && "text-foreground bg-surface"
                )}
              >
                {child.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className={cn("rnrb-header", scrolled && "scrolled")}>
        <nav className="rnrb-container h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link href="/" className="rnrb-logo flex items-center gap-3">
              <Image
                src="/rnrdark.png"
                alt="Rock N' Roll Basement"
                width={40}
                height={40}
                className="dark:hidden"
              />
              <Image
                src="/rnrlight.png"
                alt="Rock N' Roll Basement"
                width={40}
                height={40}
                className="hidden dark:block"
              />
              <span className="text-lg font-medium hidden sm:inline">
                Rock N' Roll Basement
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <nav className="flex items-center gap-6">
                {LINKS.map((link) => (
                  <NavItem key={link.label} link={link} />
                ))}
              </nav>

              <div className="flex items-center gap-4">
                {/* Command Palette Trigger */}
                <button
                  className="rnrb-button-ghost px-3 py-1.5 text-sm rounded-md flex items-center gap-2"
                  onClick={() => {/* TODO: Implement command palette */}}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden xl:inline">Search</span>
                  <kbd className="hidden xl:inline px-1.5 py-0.5 text-xs rounded bg-surface-muted border border-border">
                    <Command className="w-3 h-3 inline" />K
                  </kbd>
                </button>

                {/* <ThemeToggle /> */}
                
                <div className="h-6 w-px bg-border" />
                
                <Link
                  href="/auth"
                  className="rnrb-button-ghost px-4 py-2 rounded-md text-sm"
                >
                  Sign In
                </Link>
                
                <Link
                  href="/auth"
                  className="rnrb-button-primary px-4 py-2 rounded-md text-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          x: mobileMenuOpen ? '0%' : '100%'
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300
        }}
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l border-border z-[60] lg:hidden"
        style={{ top: '72px' }}
      >
        <nav className="p-6 space-y-6">
          {LINKS.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className={cn(
                  "block text-lg font-medium py-2",
                  isActive(link.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="ml-4 mt-2 space-y-2">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block text-sm py-1",
                        isActive(child.href) ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="pt-6 space-y-4 border-t border-border">
            <Link
              href="/auth"
              className="rnrb-button-secondary w-full py-3 rounded-md justify-center"
            >
              Sign In
            </Link>
            
            <Link
              href="/auth"
              className="rnrb-button-primary w-full py-3 rounded-md justify-center"
            >
              Get Started
            </Link>
            
            {/* <div className="flex justify-center pt-4">
              <ThemeToggle />
            </div> */}
          </div>
        </nav>
      </motion.div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] lg:hidden"
          style={{ top: '72px' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}