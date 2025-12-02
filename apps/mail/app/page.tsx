'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useMailStore, useComposeStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import EmailList from '@/components/EmailList';
import EmailView from '@/components/EmailView';
import ComposeModal from '@/components/ComposeModal';
import { Loader2 } from 'lucide-react';

export default function InboxPage() {
  const router = useRouter();
  const { isAuthenticated, email } = useAuthStore();
  const { fetchMailboxes, isLoading, selectedEmailId } = useMailStore();
  const { isOpen: isComposeOpen } = useComposeStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMailboxes();
  }, [isAuthenticated, router, fetchMailboxes]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-rnrb-black">
        <Loader2 className="h-8 w-8 animate-spin text-rnrb-orange" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-rnrb-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Email List */}
        <EmailList />

        {/* Email View */}
        {selectedEmailId ? (
          <EmailView />
        ) : (
          <div className="hidden flex-1 items-center justify-center bg-rnrb-dark lg:flex">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rnrb-panel">
                <span className="text-3xl">📧</span>
              </div>
              <p className="text-rnrb-muted">Select an email to read</p>
              <p className="mt-1 text-sm text-rnrb-muted/60">{email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && <ComposeModal />}
    </div>
  );
}
