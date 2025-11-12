'use client';

import { cn } from '@songforge/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  name: string;
  href: string;
  description?: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-10 flex flex-1 flex-col gap-1 px-4">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
              active
                ? 'bg-brand-primary text-brand-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:bg-brand-muted/50 hover:text-brand-foreground'
            )}
          >
            <span className="flex items-center justify-between gap-3">
              {item.name}
              <span
                className={cn(
                  'h-2 w-2 rounded-full transition',
                  active ? 'bg-brand-primary-foreground opacity-100' : 'bg-brand-muted-foreground opacity-0 group-hover:opacity-40'
                )}
              />
            </span>
            {item.description ? (
              <span className="mt-1 block text-xs text-muted-foreground/80">{item.description}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="border-t border-border/60 bg-surface px-4 py-3 md:hidden">
      <div className="flex items-center gap-3 overflow-x-auto text-sm">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 transition duration-200',
                active
                  ? 'bg-brand-primary text-brand-primary-foreground shadow-soft'
                  : 'bg-surface-muted text-muted-foreground hover:text-brand-foreground'
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

