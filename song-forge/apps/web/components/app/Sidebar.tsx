'use client';

import { cn } from '@cronkwaters/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { Wordmark } from '../Wordmark';

export const APP_NAV_ITEMS = [
  { name: 'Projects', href: '/projects' },
  { name: 'Music', href: '/music' },
  { name: 'Tours', href: '/tours' },
  { name: 'Practice', href: '/practice' },
  { name: 'Community', href: '/community' },
  { name: 'Learn', href: '/learn' },
  { name: 'Foundation', href: '/foundation' },
  { name: 'Sessions', href: '/sessions' },
  { name: 'Assets', href: '/assets' },
  { name: 'Splits', href: '/splits' },
  { name: 'Licenses', href: '/licenses' },
  { name: 'Settings', href: '/settings' }
] as const;

interface SidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export default function Sidebar({ userName, userEmail, ...props }: SidebarProps & { [key: string]: unknown }) {
  const pathname = usePathname();

  const initials = useMemo(() => {
    if (!userName) {
      return 'SF';
    }

    const parts = userName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');

    return parts || 'SF';
  }, [userName]);

  return (
    <aside {...props} className="shadow-soft/40 hidden h-screen w-72 border-r border-border/60 bg-surface/80 pb-10 pt-8 backdrop-blur md:flex md:flex-col">
      <div className="px-6 pb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
        >
          <Wordmark className="h-6 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4" aria-label="Main app navigation">
        <ul className="flex flex-col gap-1">
          {APP_NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary',
                    isActive
                      ? 'bg-brand-primary/15 text-brand-foreground shadow-soft'
                      : 'text-muted-foreground hover:text-brand-foreground'
                  )}
                >
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 shadow-soft">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-brand-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brand-foreground">{userName ?? 'CronkWaters Member'}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail ?? 'demo@example.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
