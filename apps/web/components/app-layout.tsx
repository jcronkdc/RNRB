'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Eager imports — needed immediately
import { Breadcrumbs } from './breadcrumbs';
import { SidebarNav, MobileMenuProvider } from './sidebar-nav';
import { TopBar } from './top-bar';
import { TransportBar } from './transport-bar';
import { FocusModeProvider, useFocusMode } from '@/hooks/use-focus-mode';
import { MobileBottomNav } from './mobile-bottom-nav';

// Dynamic imports — load on demand
const CommandPalette = dynamic(
  () => import('./command-palette').then((mod) => ({ default: mod.CommandPalette })),
  { ssr: false, loading: () => null }
);

const KeyboardShortcutsHelp = dynamic(
  () => import('./keyboard-shortcuts-help').then((mod) => ({ default: mod.KeyboardShortcutsHelp })),
  { ssr: false, loading: () => null }
);

const AssistantChat = dynamic(
  () => import('./ai-assistant/assistant-chat').then((mod) => ({ default: mod.AssistantChat })),
  { ssr: false, loading: () => null }
);

const FocusModeOverlay = dynamic(
  () => import('./focus-mode-overlay').then((mod) => ({ default: mod.FocusModeOverlay })),
  { ssr: false, loading: () => null }
);

const AppVersionChecker = dynamic(
  () => import('./app-version-checker').then((mod) => ({ default: mod.AppVersionChecker })),
  { ssr: false }
);

const UsageAlerts = dynamic(
  () => import('./billing/UsageAlerts').then((mod) => ({ default: mod.UsageAlerts })),
  { ssr: false }
);

interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  currentTrack?: any;
}

function AppLayoutContent({
  children,
  showBreadcrumbs = true,
  currentTrack = null,
}: AppLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showTransport = !!currentTrack;
  const { status } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isFocusMode } = useFocusMode();

  useEffect(() => {
    const checkSidebarState = () => {
      if (typeof window !== 'undefined') {
        setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
      }
    };
    checkSidebarState();
    window.addEventListener('storage', checkSidebarState);
    window.addEventListener('sidebar-toggle', checkSidebarState);
    return () => {
      window.removeEventListener('storage', checkSidebarState);
      window.removeEventListener('sidebar-toggle', checkSidebarState);
    };
  }, []);

  // Marketing pages bypass app layout
  const isMarketingPage =
    pathname === '/' ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/about') ||
    pathname?.startsWith('/contact');

  const isProfileSetup = pathname === '/settings/profile' && searchParams.get('setup') === 'true';

  if (isMarketingPage) return <>{children}</>;

  if (isProfileSetup) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {children}
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  const sidebarWidth = isFocusMode ? '0px' : sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)';

  return (
    <MobileMenuProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <CommandPalette />
        <KeyboardShortcutsHelp />
        <FocusModeOverlay />

        {!isFocusMode && <SidebarNav />}
        {!isFocusMode && <TopBar />}

        {/* Main content */}
        <main
          className="pb-20 transition-[margin] duration-200 lg:pb-0"
          style={{
            marginLeft: sidebarWidth,
            marginTop: isFocusMode ? '0' : 'var(--topbar-height)',
            minHeight: isFocusMode ? '100vh' : 'calc(100vh - var(--topbar-height))',
          }}
        >
          {/* Breadcrumbs */}
          {!isFocusMode && showBreadcrumbs && pathname !== '/dashboard' && (
            <div className="border-b px-5 py-2.5 lg:px-6" style={{ borderColor: 'var(--border)' }}>
              <Breadcrumbs />
            </div>
          )}

          {/* Page content */}
          <div className={isFocusMode ? 'p-4' : 'p-5 lg:p-7'}>
            {children}
          </div>
        </main>

        {showTransport && !isFocusMode && (
          <TransportBar currentTrack={currentTrack} isVisible={true} />
        )}

        {!isFocusMode && <MobileBottomNav />}
        {!isFocusMode && <AssistantChat />}

        <UsageAlerts />
        <AppVersionChecker />

        {/* Mobile sidebar override */}
        <style jsx global>{`
          @media (max-width: 1024px) {
            main { margin-left: 0 !important; }
          }
        `}</style>
      </div>
    </MobileMenuProvider>
  );
}

export function AppLayout(props: AppLayoutProps) {
  return (
    <FocusModeProvider>
      <Suspense
        fallback={
          <div
            className="flex min-h-screen items-center justify-center"
            style={{ background: 'var(--bg)' }}
          >
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
          </div>
        }
      >
        <AppLayoutContent {...props} />
      </Suspense>
    </FocusModeProvider>
  );
}
