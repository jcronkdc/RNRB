'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './UserMenu';

export function NavBar() {
  const pathname = usePathname();

    return (
    <nav className="border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold">
            RNR Basement
        </Link>
          <div className="hidden md:flex items-center gap-6">
              <Link
              href="/#who" 
              className={`nav-link ${pathname === '/#who' ? 'text-[#FF5C39]' : ''}`}
            >
              Who It's For
            </Link>
            <Link 
              href="/#how" 
              className={`nav-link ${pathname === '/#how' ? 'text-[#FF5C39]' : ''}`}
      >
              How It Works
              </Link>
                    <Link
              href="/#features" 
              className={`nav-link ${pathname === '/#features' ? 'text-[#FF5C39]' : ''}`}
                    >
              Features
            </Link>
            <Link
              href="/pricing" 
              className={`nav-link ${pathname === '/pricing' ? 'text-[#FF5C39]' : ''}`}
            >
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
          </div>
        </nav>
  );
}