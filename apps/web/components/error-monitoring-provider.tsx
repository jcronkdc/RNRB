'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { initializeErrorHandling, setUserContextForErrors } from '@/lib/global-error-handler';

/**
 * ERROR MONITORING PROVIDER
 *
 * Wraps the app to:
 * - Initialize global error handling
 * - Set user context when logged in
 * - Track page views for breadcrumbs
 */
export function ErrorMonitoringProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Initialize error handling on mount
  useEffect(() => {
    initializeErrorHandling();
  }, []);

  // Update user context when session changes
  useEffect(() => {
    if (session?.user) {
      setUserContextForErrors({
        id: session.user.id,
        email: session.user.email || undefined,
        subscriptionTier: (session.user as { subscriptionTier?: string }).subscriptionTier,
      });
    }
  }, [session]);

  return <>{children}</>;
}
