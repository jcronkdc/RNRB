'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="rnrb-app-shell">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'open' : ''} md:relative`}>
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="rnrb-main">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="rnrb-content">
          {children}
        </main>
      </div>
    </div>
  );
}
