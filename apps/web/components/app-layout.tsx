'use client';

import { usePathname } from 'next/navigation';

import { Breadcrumbs } from './breadcrumbs';
import { CommandPalette } from './command-palette';
import { KeyboardShortcutsHelp } from './keyboard-shortcuts-help';
import { SidebarNav } from './sidebar-nav';
import { TopBar } from './top-bar';
import { TransportBar } from './transport-bar';
import { AssistantChat } from './ai-assistant/assistant-chat';

import { AblyProvider } from '@/components/ably';



interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  currentTrack?: any; // Track type from transport-bar
}

export function AppLayout({
  children,
  showBreadcrumbs = true,
  currentTrack = null,
}: AppLayoutProps) {
  const pathname = usePathname();
  const showTransport = !!currentTrack;

  // Don't use app layout for marketing pages
  const isMarketingPage =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact');

  if (isMarketingPage) {
    return <>{children}</>;
  }

  return (
    <AblyProvider>
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
          <div className="p-8">{children}</div>
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
    </AblyProvider>
  );
}
