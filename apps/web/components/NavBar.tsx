'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './UserMenu';
import dynamic from 'next/dynamic';

// Dynamically import NotificationBell to avoid SSR issues
const NotificationBell = dynamic(() => import('./notification-bell').then(m => m.NotificationBell), { ssr: false });

export function NavBar() {
  const pathname = usePathname();

    return (
    <nav className="border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo-dark.png" 
              alt="Rock N' Roll Basement" 
              className="h-10 w-auto"
              style={{ filter: 'brightness(1.2) contrast(1.1)' }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {/* Features Dropdown */}
            <div className="relative group">
              <button className="nav-link flex items-center gap-1">
                Features
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-64 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                   style={{
                     background: 'var(--panel)',
                     border: '1px solid var(--border)',
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                   }}>
                <div className="p-2">
                  <Link href="/features/songwriting" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-white">Songwriting Studio</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>AI-powered chord progression & lyrics</p>
                  </Link>
                  <Link href="/features/collaboration" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-white">Real-Time Collaboration</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Video calls, screen sharing, live chat</p>
                  </Link>
                  <Link href="/features/ai-music" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-white">AI Music Generation</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Create tracks with AI assistance</p>
                  </Link>
                  <Link href="/features/project-management" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-white">Project Management</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Organize albums, EPs, and singles</p>
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
            <div className="relative group">
              <button className="nav-link flex items-center gap-1">
                Solutions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-64 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                   style={{
                     background: 'var(--panel)',
                     border: '1px solid var(--border)',
                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                   }}>
                <div className="p-2">
                  <Link href="/solutions/bands" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-white">For Bands</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Collaborate across distances</p>
                  </Link>
                  <Link href="/solutions/songwriters" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-white">For Songwriters</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Tools to craft your best songs</p>
                  </Link>
                  <Link href="/solutions/studios" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
                    <p className="text-sm font-medium text-white">For Studios</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Professional workflow tools</p>
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
              href="/about" 
              className={`nav-link ${pathname === '/about' ? 'text-[#FF5C39]' : ''}`}
            >
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <UserMenu />
        </div>
          </div>
        </nav>
  );
}