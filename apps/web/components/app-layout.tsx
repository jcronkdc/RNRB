'use client';

import { useState } from 'react';
import { SidebarNav } from './sidebar-nav';
import { TopBar } from './top-bar';
import { TransportBar } from './transport-bar';
import { Breadcrumbs } from './breadcrumbs';
import { AblyProvider } from '@/components/ably';

interface AppLayoutProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  currentTrack?: any; // Track type from transport-bar
}

export function AppLayout({ 
  children, 
  showBreadcrumbs = true,
  currentTrack = null 
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTransport, setShowTransport] = useState(!!currentTrack);
  
  return (
    <AblyProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <SidebarNav />
        
        {/* Top Bar */}
        <TopBar />
        
        {/* Main Content Area */}
        <main 
          className={`
            transition-all duration-300 ease-out
            pt-[56px]
            ${sidebarCollapsed ? 'pl-[64px]' : 'pl-[240px]'}
            ${showTransport ? 'pb-[72px]' : 'pb-0'}
          `}
        >
          {/* Breadcrumbs */}
          {showBreadcrumbs && (
            <div className="border-b border-border">
              <div className="px-6 py-3">
                <Breadcrumbs />
              </div>
            </div>
          )}
          
          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
        
        {/* Transport Bar */}
        <TransportBar 
          currentTrack={currentTrack}
          isVisible={showTransport}
        />
      </div>
    </AblyProvider>
  );
}
