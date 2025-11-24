'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { UserMenu } from './UserMenu';

// Dynamically import NotificationBell to avoid SSR issues
const NotificationBell = dynamic(
  () => import('./notification-bell').then((m) => m.NotificationBell),
  { ssr: false }
);

export function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              className="h-10 w-auto"
              width={120}
              height={40}
              priority
              style={{ filter: 'brightness(1.2) contrast(1.1)' }}
            />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {/* Features Dropdown */}
            <div className="group relative">
              <button className="nav-link flex items-center gap-1">
                Features
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className="invisible absolute left-0 z-50 mt-2 w-64 rounded-xl opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="p-2">
                  <Link
                    href="/features/songwriting"
                    className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">Songwriting Studio</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      AI-powered chord progression & lyrics
                    </p>
                  </Link>
                  <Link
                    href="/features/collaboration"
                    className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">Real-Time Collaboration</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Video calls, screen sharing, live chat
                    </p>
                  </Link>
                  <Link
                    href="/features/ai-music"
                    className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">AI Music Generation</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Create tracks with AI assistance
                    </p>
                  </Link>
                  <Link
                    href="/features/project-management"
                    className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">Project Management</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Organize albums, EPs, and singles
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/#how"
              className={`nav-link ${pathname === '/#how' ? 'text-[#FF5C39]' : ''}`}
            >
              How It Works
            </Link>

            {/* Solutions Dropdown */}
            <div className="group relative">
              <button className="nav-link flex items-center gap-1">
                Solutions
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className="invisible absolute left-0 z-50 mt-2 w-64 rounded-xl opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="p-2">
                  <Link
                    href="/#solutions"
                    className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">For Bands</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Collaborate across distances
                    </p>
                  </Link>
                  <Link
                    href="/#solutions"
                    className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">For Songwriters</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Tools to craft your best songs
                    </p>
                  </Link>
                  <Link
                    href="/#solutions"
                    className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">For Studios</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      Professional workflow tools
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className={`nav-link ${pathname === '/pricing' ? 'text-[#FF5C39]' : ''}`}
            >
              Pricing
            </Link>

            <Link
              href="/why-rnrb"
              className={`nav-link ${pathname === '/why-rnrb' ? 'text-[#FF5C39]' : ''}`}
            >
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <UserMenu />

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-2 transition-colors hover:bg-white/5 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 right-0 top-16 z-50 border-b border-[var(--border)] bg-[var(--panel)] md:hidden">
            <div className="container space-y-4 py-4">
              {/* Features Section */}
              <div>
                <p className="mb-2 px-3 text-xs font-semibold text-[var(--muted)]">FEATURES</p>
                <Link
                  href="/features/songwriting"
                  className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p className="text-sm font-medium text-white">Songwriting Studio</p>
                  <p className="text-xs text-[var(--muted)]">
                    AI-powered chord progression & lyrics
                  </p>
                </Link>
                <Link
                  href="/features/collaboration"
                  className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p className="text-sm font-medium text-white">Real-Time Collaboration</p>
                  <p className="text-xs text-[var(--muted)]">
                    Video calls, screen sharing, live chat
                  </p>
                </Link>
                <Link
                  href="/features/ai-music"
                  className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p className="text-sm font-medium text-white">AI Music Generation</p>
                  <p className="text-xs text-[var(--muted)]">Create tracks with AI assistance</p>
                </Link>
                <Link
                  href="/features/project-management"
                  className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p className="text-sm font-medium text-white">Project Management</p>
                  <p className="text-xs text-[var(--muted)]">Organize albums, EPs, and singles</p>
                </Link>
              </div>

              {/* Other Links */}
              <div className="border-t border-[var(--border)] pt-4">
                <Link
                  href="/#how"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
              </div>

              {/* Solutions Section */}
              <div className="border-t border-[var(--border)] pt-4">
                <p className="mb-2 px-3 text-xs font-semibold text-[var(--muted)]">SOLUTIONS</p>
                <Link
                  href="/#solutions"
                  className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p className="text-sm font-medium text-white">For Bands</p>
                  <p className="text-xs text-[var(--muted)]">Collaborate across distances</p>
                </Link>
                <Link
                  href="/#solutions"
                  className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p className="text-sm font-medium text-white">For Songwriters</p>
                  <p className="text-xs text-[var(--muted)]">Tools to craft your best songs</p>
                </Link>
                <Link
                  href="/#solutions"
                  className="block rounded-lg px-3 py-2 transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <p className="text-sm font-medium text-white">For Studios</p>
                  <p className="text-xs text-[var(--muted)]">Professional workflow tools</p>
                </Link>
              </div>

              {/* Bottom Links */}
              <div className="border-t border-[var(--border)] pt-4">
                <Link
                  href="/pricing"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/why-rnrb"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-white transition-all hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
