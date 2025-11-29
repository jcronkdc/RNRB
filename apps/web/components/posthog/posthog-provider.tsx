'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize PostHog in the browser
    if (typeof window === 'undefined') return;

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (!apiKey) {
      // PostHog is optional - silently skip initialization if not configured
      console.debug('PostHog: API key not configured, analytics disabled');
      return;
    }

    // Initialize PostHog only if we have a valid API key
    if (!posthog.__loaded) {
      posthog.init(apiKey, {
        api_host: host,
        person_profiles: 'identified_only', // Only create profiles for identified users
        loaded: (ph) => {
          // Enable debug mode in development
          if (process.env.NODE_ENV === 'development') {
            ph.debug();
          }
          console.log('✅ PostHog initialized successfully');
        },
        capture_pageview: true, // Auto-capture page views
        capture_pageleave: true, // Auto-capture page exits
        autocapture: {
          dom_event_allowlist: ['click', 'change', 'submit'], // Capture key interactions
        },
      });
    }
  }, []);

  return <>{children}</>;
}

// Legacy hook - kept for backwards compatibility
export function usePostHogIdentify(
  userId: string | null | undefined,
  userProperties?: Record<string, any>
) {
  useEffect(() => {
    if (userId && posthog.__loaded) {
      posthog.identify(userId, userProperties);
    }
  }, [userId, userProperties]);
}
