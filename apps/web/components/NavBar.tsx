'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    description: 'Chord progressions, lyrics, version control',
  },
  {
    label: 'Real-Time Collaboration',
    href: '/features/collaboration',
    description: 'Video calls, screen sharing, live chat',
  },
  {
    label: 'Music Creation Tools',
    href: '/features/ai-music',
    description: 'Backing tracks, arrangements, demos',
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
    description: 'Creative tools, copyright protection, find collaborators',
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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

  // Icon mappings for visual interest
  const getIcon = (href: string) => {
    if (href.includes('songwriting'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    if (href.includes('collaboration'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    if (href.includes('ai-music') || href.includes('music'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    if (href.includes('project'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
    if (href.includes('bands'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      );
    if (href.includes('songwriters'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      );
    if (href.includes('studios'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      );
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    );
  };

  // Color accents for different items
  const getAccentColor = (index: number) => {
    const colors = ['var(--accent)', 'var(--gold)', 'var(--sage)', '#8b5cf6'];
    return colors[index % colors.length];
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
        className="nav-link group flex items-center gap-1.5 px-3 py-2 transition-all duration-300"
        style={{ color: isOpen ? 'var(--accent)' : undefined }}
      >
        <span className="relative">
          {label}
          <span
            className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-[var(--accent)] to-[var(--gold)] transition-all duration-300 ${
              isOpen ? 'w-full' : 'w-0'
            }`}
          />
        </span>
        <svg
          className={`h-3.5 w-3.5 transition-all duration-300 ${isOpen ? 'rotate-180 text-[var(--accent)]' : 'group-hover:translate-y-0.5'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        role="menu"
        aria-orientation="vertical"
        className={`absolute left-1/2 z-50 mt-3 w-80 origin-top -translate-x-1/2 transition-all duration-300 ease-out ${
          isOpen
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'invisible -translate-y-3 scale-95 opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(180deg, rgba(38, 38, 38, 0.98) 0%, rgba(28, 28, 28, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.05),
            0 20px 50px -10px rgba(0, 0, 0, 0.7),
            0 10px 30px -5px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Decorative top gradient line */}
        <div
          className="absolute left-4 right-4 top-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--accent) 20%, var(--gold) 50%, var(--sage) 80%, transparent 100%)',
            opacity: 0.5,
          }}
        />

        {/* Pointer arrow */}
        <div
          className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"
          style={{
            background: 'rgba(38, 38, 38, 0.98)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        />

        <div className="relative p-2">
          {items.map((item, index) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group/item relative flex items-start gap-4 rounded-xl px-4 py-3.5 transition-all duration-200"
              style={{
                background:
                  hoveredIndex === index
                    ? `linear-gradient(135deg, ${getAccentColor(index)}15, transparent)`
                    : 'transparent',
              }}
            >
              {/* Icon container */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300"
                style={{
                  background:
                    hoveredIndex === index
                      ? `${getAccentColor(index)}20`
                      : 'rgba(255, 255, 255, 0.05)',
                  color: hoveredIndex === index ? getAccentColor(index) : 'var(--muted)',
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {getIcon(item.href)}
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-medium transition-colors duration-200"
                  style={{
                    color: hoveredIndex === index ? 'var(--text)' : 'var(--text-secondary)',
                  }}
                >
                  {item.label}
                </p>
                {item.description && (
                  <p
                    className="mt-0.5 text-xs leading-relaxed transition-colors duration-200"
                    style={{ color: 'var(--muted)' }}
                  >
                    {item.description}
                  </p>
                )}
              </div>

              {/* Arrow indicator */}
              <svg
                className="h-4 w-4 shrink-0 self-center transition-all duration-200"
                style={{
                  color: hoveredIndex === index ? getAccentColor(index) : 'transparent',
                  transform: hoveredIndex === index ? 'translateX(0)' : 'translateX(-8px)',
                  opacity: hoveredIndex === index ? 1 : 0,
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>

              {/* Hover glow effect */}
              {hoveredIndex === index && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-30"
                  style={{
                    background: `radial-gradient(circle at 30% 50%, ${getAccentColor(index)}30, transparent 70%)`,
                  }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Bottom subtle gradient */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-2xl"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          }}
        />
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
  const [activeSection, setActiveSection] = useState<string | null>('features');

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

  // Icon helper
  const getIcon = (href: string) => {
    if (href.includes('songwriting'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    if (href.includes('collaboration'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    if (href.includes('ai-music') || href.includes('music'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    if (href.includes('project'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
    if (href.includes('bands'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      );
    if (href.includes('songwriters'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      );
    if (href.includes('studios'))
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      );
    return null;
  };

  const getAccentColor = (index: number) => {
    const colors = ['var(--accent)', 'var(--gold)', 'var(--sage)', '#8b5cf6'];
    return colors[index % colors.length];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0,0,0,0.7), rgba(0,0,0,0.9))',
          backdropFilter: 'blur(8px)',
        }}
      />

      {/* Menu Panel */}
      <nav
        className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto md:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8)',
        }}
        aria-label="Mobile navigation"
      >
        {/* Top decorative line */}
        <div
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, var(--accent) 20%, var(--gold) 50%, var(--sage) 80%, transparent 100%)',
            opacity: 0.4,
          }}
        />

        <div className="container py-5">
          {/* Section Tabs */}
          <div className="mb-4 flex gap-2 px-1">
            {['features', 'solutions'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(activeSection === section ? null : section)}
                className="flex-1 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                style={{
                  background:
                    activeSection === section
                      ? 'linear-gradient(135deg, rgba(232, 93, 59, 0.15), rgba(212, 175, 55, 0.1))'
                      : 'rgba(255, 255, 255, 0.03)',
                  border:
                    activeSection === section
                      ? '1px solid rgba(232, 93, 59, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                  color: activeSection === section ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Features Section */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              activeSection === 'features' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mb-4 space-y-1">
              {FEATURES.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `${getAccentColor(index)}15`,
                      color: getAccentColor(index),
                    }}
                  >
                    {getIcon(item.href)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs" style={{ color: 'var(--muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--muted)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Solutions Section */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              activeSection === 'solutions' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mb-4 space-y-1">
              {SOLUTIONS.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `${getAccentColor(index)}15`,
                      color: getAccentColor(index),
                    }}
                  >
                    {getIcon(item.href)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {item.label}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: 'var(--muted)' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0"
                    style={{ color: 'var(--muted)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div
            className="my-4 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}
          />

          {/* Quick Links */}
          <div className="space-y-1">
            <Link
              href="/#how"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                color: 'var(--text)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="h-5 w-5"
                  style={{ color: 'var(--muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                How It Works
              </span>
              <svg
                className="h-4 w-4"
                style={{ color: 'var(--muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/pricing"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                color: 'var(--text)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="h-5 w-5"
                  style={{ color: 'var(--muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pricing
              </span>
              <svg
                className="h-4 w-4"
                style={{ color: 'var(--muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              href="/why-rnrb"
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                color: 'var(--text)',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="h-5 w-5"
                  style={{ color: 'var(--muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                About
              </span>
              <svg
                className="h-4 w-4"
                style={{ color: 'var(--muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* CTA Button */}
          <div className="mt-6 px-1">
            <Link
              href="/auth?signup=true"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #d4691e 100%)',
                boxShadow: '0 4px 20px rgba(232, 93, 59, 0.3)',
              }}
            >
              Start Creating Free
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
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
  // Also hide on public profile pages which have their own layout
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
    pathname?.startsWith('/discover') ||
    pathname?.startsWith('/messages') ||
    pathname?.startsWith('/notifications') ||
    pathname?.startsWith('/collaboration') ||
    pathname?.startsWith('/credits') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/onboarding') ||
    pathname?.startsWith('/community') ||
    pathname?.startsWith('/sites') ||
    pathname?.startsWith('/labs') ||
    pathname?.startsWith('/songs') ||
    pathname?.startsWith('/feed') ||
    pathname?.startsWith('/tools') ||
    pathname?.startsWith('/live') ||
    pathname?.startsWith('/meet') ||
    pathname?.startsWith('/marketplace') ||
    pathname?.startsWith('/masterclasses') ||
    pathname?.startsWith('/merch') ||
    pathname?.startsWith('/opportunities') ||
    pathname?.startsWith('/affiliate') ||
    pathname?.startsWith('/share') ||
    pathname?.startsWith('/revenue') ||
    pathname?.startsWith('/admin') || // Admin dashboard has its own layout
    pathname?.startsWith('/u/') || // Public profile pages have their own layout
    pathname?.startsWith('/setlist/'); // Public setlist pages (viral loop)

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
