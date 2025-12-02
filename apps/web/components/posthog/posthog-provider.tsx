'use client';

import posthog from 'posthog-js';
import { useEffect, useCallback, useRef } from 'react';

/**
 * Performance-optimized PostHog Provider
 *
 * LIGHTHOUSE RECOMMENDATION: Minimize third-party usage
 * - Deferred loading: Only initializes after page is interactive
 * - Idle callback: Uses requestIdleCallback for non-blocking init
 * - No render blocking: Analytics loads after critical path
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const initAttempted = useRef(false);

  const initPostHog = useCallback(() => {
    // Prevent double initialization
    if (initAttempted.current) return;
    initAttempted.current = true;

    // Only initialize PostHog in the browser
    if (typeof window === 'undefined') return;

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (!apiKey) {
      // PostHog is optional - silently skip initialization if not configured
      if (process.env.NODE_ENV === 'development') {
        console.debug('PostHog: API key not configured, analytics disabled');
      }
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
            console.log('✅ PostHog initialized successfully');
          }
        },
        capture_pageview: true, // Auto-capture page views
        capture_pageleave: true, // Auto-capture page exits
        // Performance: Disable autocapture to reduce main thread work
        autocapture: false, // Significantly reduces main-thread work
        // Performance: Reduce network requests
        disable_session_recording: true, // Enable only if needed
        // Performance: Batch events
        request_batching: true, // Batch network requests
        // Performance: Reduce DOM scanning
        disable_external_dependency_loading: true,
      });
    }
  }, []);

  useEffect(() => {
    // PERFORMANCE: Defer PostHog initialization to after page is interactive
    // This prevents analytics from blocking the critical rendering path

    if (typeof window === 'undefined') return;

    // Use requestIdleCallback for non-blocking initialization
    // Falls back to setTimeout for browsers that don't support it
    if ('requestIdleCallback' in window) {
      const idleCallbackId = window.requestIdleCallback(initPostHog, {
        timeout: 3000, // Max wait 3 seconds before initializing anyway
      });
      return () => window.cancelIdleCallback(idleCallbackId);
    } else {
      // Fallback: Initialize after a short delay to not block initial render
      const timeoutId = setTimeout(initPostHog, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [initPostHog]);

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
