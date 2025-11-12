'use client';

import { Button, cn } from '@cronkwater/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useMemo } from 'react';

const NAV_ITEMS = [
  { label: 'Songs', href: '/dashboard' },
  { label: 'Stems', href: '/dashboard/stems' },
  { label: 'Splits', href: '/dashboard/splits' },
  { label: 'Distribute', href: '/dashboard/distribute' }
] as const;

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  const activeLabel = useMemo(() => {
    if (pathname === '/dashboard') {
      return 'Projects';
    }
    const found = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
    return found?.label ?? 'Studio';
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 flex-col border-r border-border/50 bg-surface/80 px-6 py-10 shadow-soft md:flex">
        <Link href="/" className="mb-12 block">
          <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground">CronkWater</div>
          <div className="mt-3 text-lg font-semibold text-brand-foreground">Creator Studio</div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-surface-elevated text-brand-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-surface hover:text-brand-foreground'
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-opacity',
                    isActive ? 'bg-brand-primary opacity-100' : 'opacity-0 group-hover:opacity-50'
                  )}
                />
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-dashed border-border/60 bg-surface p-4 text-sm text-muted-foreground">
          Share your latest session with collaborators using secure backstage links.
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-surface/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">CronkWater Studio</p>
            <h1 className="mt-2 text-2xl font-semibold text-brand-foreground">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/style-guide" className="text-sm text-muted-foreground hover:text-brand-foreground">
              Style Guide
            </Link>
            <Button size="sm" className="shadow-soft hover:shadow-elevated">
              New project
            </Button>
          </div>
        </header>
        <main className="flex-1 bg-background px-6 py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

