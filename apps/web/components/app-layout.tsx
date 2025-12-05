'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Eager imports - needed immediately
import { Breadcrumbs } from './breadcrumbs';
import { SidebarNav, MobileMenuProvider } from './sidebar-nav';
import { TopBar } from './top-bar';
import { TransportBar } from './transport-bar';
import { FocusModeProvider, useFocusMode } from '@/hooks/use-focus-mode';
import { MobileBottomNav } from './mobile-bottom-nav';

// Dynamic imports - load on-demand to reduce initial bundle
// These components are only needed when user interacts with them
const CommandPalette = dynamic(
  () => import('./command-palette').then((mod) => ({ default: mod.CommandPalette })),
  {
    ssr: false,
    loading: () => null, // No loading UI needed - component handles its own visibility
  }
);

const KeyboardShortcutsHelp = dynamic(
  () => import('./keyboard-shortcuts-help').then((mod) => ({ default: mod.KeyboardShortcutsHelp })),
  {
    ssr: false,
    loading: () => null,
  }
);

const AssistantChat = dynamic(
  () => import('./ai-assistant/assistant-chat').then((mod) => ({ default: mod.AssistantChat })),
  {
    ssr: false,
    loading: () => null,
  }
);

const FocusModeOverlay = dynamic(
  () => import('./focus-mode-overlay').then((mod) => ({ default: mod.FocusModeOverlay })),
  {
    ssr: false,
    loading: () => null,
  }
);

// Can load after initial render since they're not immediately visible
const AppVersionChecker = dynamic(
  () => import('./app-version-checker').then((mod) => ({ default: mod.AppVersionChecker })),
  {
    ssr: false,
  }
);

const UsageAlerts = dynamic(
  () => import('./billing/UsageAlerts').then((mod) => ({ default: mod.UsageAlerts })),
  {
    ssr: false,
  }
);

// NOTE: AblyProvider removed - it's already provided in app/layout.tsx
// Having nested AblyProviders caused duplicate connections and ERR_INSUFFICIENT_RESOURCES

interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  currentTrack?: any; // Track type from transport-bar
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

  // Listen to sidebar collapse state from localStorage
  useEffect(() => {
    const checkSidebarState = () => {
      if (typeof window !== 'undefined') {
        const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
        setSidebarCollapsed(collapsed);
      }
    };

    // Check initial state
    checkSidebarState();

    // Listen for storage changes (when sidebar is toggled)
    window.addEventListener('storage', checkSidebarState);

    // Also listen for custom event for same-tab changes
    const handleSidebarToggle = () => checkSidebarState();
    window.addEventListener('sidebar-toggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', checkSidebarState);
      window.removeEventListener('sidebar-toggle', handleSidebarToggle);
    };
  }, []);

  // Don't use app layout for marketing pages
  const isMarketingPage =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact');

  // Check if this is the profile setup flow (minimal UI needed)
  const isProfileSetup = pathname === '/settings/profile' && searchParams.get('setup') === 'true';

  if (isMarketingPage) {
    return <>{children}</>;
  }

  // Minimal layout for profile setup - clean, focused, no distractions
  if (isProfileSetup) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {children}
      </div>
    );
  }

  // Show loading skeleton while session is loading to prevent errors
  if (status === 'loading') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <p className="text-lg" style={{ color: 'var(--muted)' }}>
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MobileMenuProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        {/* Command Palette (Global) */}
        <CommandPalette />

        {/* Keyboard Shortcuts Help (Global) */}
        <KeyboardShortcutsHelp />

        {/* Focus Mode Overlay */}
        <FocusModeOverlay />

        {/* Sidebar - hidden in focus mode */}
        {!isFocusMode && <SidebarNav />}

        {/* Top Bar - hidden in focus mode */}
        {!isFocusMode && <TopBar />}

        {/* Main Content Area */}
        <main
          className="pb-20 lg:pb-0"
          style={{
            marginLeft: isFocusMode ? '0' : sidebarCollapsed ? '72px' : '260px',
            marginTop: isFocusMode ? '0' : '56px',
            marginBottom: showTransport && !isFocusMode ? '72px' : '0',
            minHeight: isFocusMode ? '100vh' : 'calc(100vh - 56px)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Breadcrumbs - hidden in focus mode */}
          {!isFocusMode && showBreadcrumbs && pathname !== '/dashboard' && (
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="px-6 py-3">
                <Breadcrumbs />
              </div>
            </div>
          )}

          {/* Page Content - full screen in focus mode */}
          <div className={isFocusMode ? 'p-4' : 'p-6 lg:p-8'}>{children}</div>
        </main>

        {/* Transport Bar - hidden in focus mode */}
        {showTransport && !isFocusMode && (
          <TransportBar currentTrack={currentTrack} isVisible={true} />
        )}

        {/* Mobile Bottom Navigation - hidden in focus mode */}
        {!isFocusMode && <MobileBottomNav />}

        {/* AI Assistant (Floating Widget) - hidden in focus mode */}
        {!isFocusMode && <AssistantChat />}

        {/* Usage Alerts (Low credit warnings) */}
        <UsageAlerts />

        {/* App Version Checker (Update notifications) */}
        <AppVersionChecker />

        {/* Mobile Overlay for Sidebar */}
        <style jsx global>{`
          @media (max-width: 1024px) {
            main {
              margin-left: 0 !important;
            }
          }
        `}</style>
      </div>
    </MobileMenuProvider>
  );
}

// Wrap in Suspense to handle useSearchParams() boundary
export function AppLayout(props: AppLayoutProps) {
  return (
    <FocusModeProvider>
      <Suspense
        fallback={
          <div
            className="flex min-h-screen items-center justify-center"
            style={{ background: 'var(--bg)' }}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <p className="text-lg" style={{ color: 'var(--muted)' }}>
                Loading...
              </p>
            </div>
          </div>
        }
      >
        <AppLayoutContent {...props} />
      </Suspense>
    </FocusModeProvider>
  );
}
