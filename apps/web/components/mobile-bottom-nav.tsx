'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Music2, FolderOpen, Library, Video } from '@/components/ui/custom-icons';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Home',
    matchPaths: ['/dashboard'],
  },
  {
    href: '/songwriting',
    icon: Music2,
    label: 'Songs',
    matchPaths: ['/songwriting', '/songs'],
  },
  {
    href: '/projects',
    icon: FolderOpen,
    label: 'Projects',
    matchPaths: ['/projects'],
  },
  {
    href: '/library',
    icon: Library,
    label: 'Library',
    matchPaths: ['/library'],
  },
  {
    href: '/meet',
    icon: Video,
    label: 'Sessions',
    matchPaths: ['/meet'],
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    return item.matchPaths?.some((path) => pathname.startsWith(path)) ?? false;
  };

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 lg:hidden"
      style={{
        background: 'var(--panel)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                style={{
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'white' : 'var(--muted)',
                }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? 'var(--text)' : 'var(--muted)' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
