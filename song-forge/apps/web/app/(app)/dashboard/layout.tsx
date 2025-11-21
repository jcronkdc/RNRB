'use client';

import { Button, cn } from '@cronkwaters/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useMemo, useState, useCallback, useEffect, useRef, memo } from 'react';
import { Plus } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Songs', href: '/dashboard' },
  { label: 'Stems', href: '/dashboard/stems' },
  { label: 'Splits', href: '/dashboard/splits' },
  { label: 'Distribute', href: '/dashboard/distribute' }
] as const;

interface DashboardLayoutProps {
  children: ReactNode;
}

// Memoized navigation item component
const NavItem = memo(({ 
  item, 
  isActive 
}: { 
  item: typeof NAV_ITEMS[number]; 
  isActive: boolean;
}) => (
  <Link
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
));
NavItem.displayName = 'NavItem';

// Memoized dropdown menu component
const NewProjectMenu = memo(({ onClose }: { onClose: () => void }) => (
  <>
    <div 
      className="fixed inset-0 z-10" 
      onClick={onClose}
    />
    <div className="absolute right-0 top-full mt-2 w-56 z-20 rnrb-card p-2 shadow-xl">
      <Link
        href="/projects/new"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-surface transition-colors"
        onClick={onClose}
      >
        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <span className="text-lg">📁</span>
        </div>
        <div>
          <div className="font-medium">New Project</div>
          <div className="text-xs text-muted-foreground">Organize songs & collaborators</div>
        </div>
      </Link>
      
      <Link
        href="/dashboard/sessions"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-surface transition-colors"
        onClick={onClose}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <span className="text-lg">🎙️</span>
        </div>
        <div>
          <div className="font-medium">New Session</div>
          <div className="text-xs text-muted-foreground">Start recording or rehearsal</div>
        </div>
      </Link>
      
      <Link
        href="/dashboard/assets"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-surface transition-colors"
        onClick={onClose}
      >
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <span className="text-lg">🎵</span>
        </div>
        <div>
          <div className="font-medium">Upload Asset</div>
          <div className="text-xs text-muted-foreground">Audio, stems, or documents</div>
        </div>
      </Link>
      
      <div className="h-px bg-border my-2" />
      
      <Link
        href="/dashboard/splits"
        className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-surface transition-colors"
        onClick={onClose}
      >
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <span className="text-lg">📊</span>
        </div>
        <div>
          <div className="font-medium">New Split Sheet</div>
          <div className="text-xs text-muted-foreground">Manage royalty splits</div>
        </div>
      </Link>
    </div>
  </>
));
NewProjectMenu.displayName = 'NewProjectMenu';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [showNewProjectMenu, setShowNewProjectMenu] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  const activeLabel = useMemo(() => {
    if (pathname === '/dashboard') {
      return 'Projects';
    }
    const found = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
    return found?.label ?? 'Studio';
  }, [pathname]);

  // Memoized callback for toggling menu
  const toggleMenu = useCallback(() => {
    setShowNewProjectMenu(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setShowNewProjectMenu(false);
  }, []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNewProjectMenu) {
        closeMenu();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showNewProjectMenu, closeMenu]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 flex-col border-r border-border/50 bg-surface/80 px-6 py-10 shadow-soft md:flex">
        <Link href="/" className="mb-12 block">
          <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground">CronkWaters</div>
          <div className="mt-3 text-lg font-semibold text-brand-foreground">Creator Studio</div>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <NavItem key={item.href} item={item} isActive={isActive} />;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-dashed border-border/60 bg-surface p-4 text-sm text-muted-foreground">
          Share your latest session with collaborators using secure backstage links.
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-surface/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">CronkWaters Studio</p>
            <h1 className="mt-2 text-2xl font-semibold text-brand-foreground">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/style-guide" className="text-sm text-muted-foreground hover:text-brand-foreground">
              Style Guide
            </Link>
            <div className="relative" ref={menuButtonRef}>
              <Button 
                size="sm" 
                className="shadow-soft hover:shadow-elevated"
                onClick={toggleMenu}
                aria-expanded={showNewProjectMenu}
                aria-haspopup="true"
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
              
              {showNewProjectMenu && <NewProjectMenu onClose={closeMenu} />}
            </div>
          </div>
        </header>
        <main className="flex-1 bg-background px-6 py-10 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

