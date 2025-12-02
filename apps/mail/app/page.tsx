'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useMailStore, useComposeStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme-store';
import Sidebar from '@/components/Sidebar';
import EmailList from '@/components/EmailList';
import EmailView from '@/components/EmailView';
import ComposeModal from '@/components/ComposeModal';
import { Loader2 } from 'lucide-react';

export default function InboxPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const { fetchMailboxes, fetchEmails, selectedMailboxId, loading: mailLoading } = useMailStore();
  const { isOpen: composeOpen } = useComposeStore();
  const { resolvedTheme } = useThemeStore();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch mailboxes on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchMailboxes();
    }
  }, [isAuthenticated, fetchMailboxes]);

  // Fetch emails when mailbox changes
  useEffect(() => {
    if (isAuthenticated && selectedMailboxId) {
      fetchEmails(selectedMailboxId);
    }
  }, [isAuthenticated, selectedMailboxId, fetchEmails]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div
        className="transition-theme flex h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render inbox if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="transition-theme flex h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Three-column layout like ProtonMail */}
      <Sidebar />
      <EmailList />
      <EmailView />

      {/* Compose modal */}
      {composeOpen && <ComposeModal />}
    </div>
  );
}
