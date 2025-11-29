'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';

import { AssistantChat } from './ai-assistant/assistant-chat';
import { Breadcrumbs } from './breadcrumbs';
import { CommandPalette } from './command-palette';
import { KeyboardShortcutsHelp } from './keyboard-shortcuts-help';
import { SidebarNav, MobileMenuProvider } from './sidebar-nav';
import { TopBar } from './top-bar';
import { TransportBar } from './transport-bar';

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

        {/* Sidebar */}
        <SidebarNav />

        {/* Top Bar */}
        <TopBar />

        {/* Main Content Area */}
        <main
          style={{
            marginLeft: '260px',
            marginTop: '56px',
            marginBottom: showTransport ? '72px' : '0',
            minHeight: 'calc(100vh - 56px)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Breadcrumbs */}
          {showBreadcrumbs && pathname !== '/dashboard' && (
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="px-6 py-3">
                <Breadcrumbs />
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="p-6 lg:p-8">{children}</div>
        </main>

        {/* Transport Bar */}
        {showTransport && <TransportBar currentTrack={currentTrack} isVisible={true} />}

        {/* AI Assistant (Floating Widget) */}
        <AssistantChat />

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
  );
}
