import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { identifyUser, resetUser, trackEvent } from '@/lib/posthog';

/**
 * Hook to automatically identify users when they sign in
 * Add this to your main layout or a high-level component
 */
export function usePostHogUser() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // User is signed in - identify them
      identifyUser(session.user.id, {
        email: session.user.email || undefined,
        name: session.user.name || undefined,
        // Add any other user properties you want to track
      });
    } else {
      // User is signed out - reset
      resetUser();
    }
  }, [session, status]);
}

/**
 * Hook to track events easily from components
 */
export function usePostHogTracking() {
  return {
    track: trackEvent,
  };
}
