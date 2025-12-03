/**
 * GLOBAL ERROR HANDLER
 *
 * Sets up global error catching for:
 * - Uncaught exceptions
 * - Unhandled promise rejections
 * - Network errors
 * - Performance issues
 * - Navigation tracking
 */

'use client';

import {
  reportError,
  reportNetworkError,
  reportPerformanceIssue,
  addBreadcrumb,
  retryPendingErrors,
  setErrorUserContext,
} from './error-monitoring';

let isInitialized = false;

/**
 * Initialize global error handling
 */
export function initializeErrorHandling(): void {
  if (typeof window === 'undefined' || isInitialized) return;

  isInitialized = true;

  // Catch uncaught exceptions
  window.addEventListener('error', (event) => {
    const { message, filename, lineno, colno, error } = event;

    reportError(error || message, {
      category: 'javascript',
      metadata: {
        filename,
        lineno,
        colno,
      },
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

    reportError(error, {
      category: 'javascript',
      metadata: {
        type: 'unhandledrejection',
        reason: String(event.reason).slice(0, 500),
      },
    });
  });

  // Track navigation for breadcrumbs
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    addBreadcrumb({
      type: 'navigation',
      category: 'history',
      message: `Navigate to ${args[2]}`,
      data: { url: args[2] as string },
    });
    return originalPushState.apply(this, args);
  };

  history.replaceState = function (...args) {
    addBreadcrumb({
      type: 'navigation',
      category: 'history',
      message: `Replace state ${args[2]}`,
      data: { url: args[2] as string },
    });
    return originalReplaceState.apply(this, args);
  };

  window.addEventListener('popstate', () => {
    addBreadcrumb({
      type: 'navigation',
      category: 'history',
      message: `Back/Forward to ${window.location.pathname}`,
      data: { url: window.location.pathname },
    });
  });

  // Track clicks for breadcrumbs
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const button = target.closest('button');
      const link = target.closest('a');
      const interactive = target.closest('[role="button"], [role="menuitem"]');

      if (button || link || interactive) {
        const element = button || link || interactive;
        const text =
          element?.textContent?.trim().slice(0, 50) ||
          element?.getAttribute('aria-label') ||
          'Unknown';

        addBreadcrumb({
          type: 'click',
          category: 'ui',
          message: `Click: ${text}`,
          data: {
            tag: element?.tagName.toLowerCase(),
            href: link?.getAttribute('href'),
            id: element?.id || undefined,
            class: element?.className?.toString().slice(0, 100) || undefined,
          },
        });
      }
    },
    { capture: true }
  );

  // Intercept fetch for network error tracking
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const startTime = performance.now();
    const firstArg = args[0];
    const url =
      typeof firstArg === 'string'
        ? firstArg
        : firstArg instanceof URL
          ? firstArg.toString()
          : (firstArg as Request)?.url || 'unknown';
    const method = (typeof args[1] === 'object' ? args[1]?.method : undefined) || 'GET';

    addBreadcrumb({
      type: 'xhr',
      category: 'fetch',
      message: `${method} ${url}`,
      data: { method, url },
    });

    try {
      const response = await originalFetch.apply(this, args);
      const duration = performance.now() - startTime;

      // Track slow requests
      if (duration > 5000) {
        reportPerformanceIssue('fetch_duration', duration, 5000);
      }

      // Track API errors
      if (!response.ok && !url.includes('/api/admin/error')) {
        // Don't report error-reporting errors
        const isServerError = response.status >= 500;
        const isClientError = response.status >= 400 && response.status < 500;

        if (isServerError) {
          reportNetworkError(url, `HTTP ${response.status}: ${response.statusText}`);
        } else if (isClientError && response.status !== 401 && response.status !== 404) {
          // Don't report auth redirects or normal 404s
          addBreadcrumb({
            type: 'xhr',
            category: 'fetch',
            message: `${method} ${url} - ${response.status}`,
            data: { method, url, status: response.status },
          });
        }
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Network failure
      reportNetworkError(url, error instanceof Error ? error : new Error(String(error)));

      addBreadcrumb({
        type: 'xhr',
        category: 'fetch',
        message: `${method} ${url} - FAILED`,
        data: { method, url, error: String(error), duration },
      });

      throw error;
    }
  };

  // Monitor performance
  if ('PerformanceObserver' in window) {
    // Long tasks (blocking the main thread)
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 100) {
            addBreadcrumb({
              type: 'custom',
              category: 'performance',
              message: `Long task: ${Math.round(entry.duration)}ms`,
              data: { duration: entry.duration },
            });

            // Report very long tasks
            if (entry.duration > 500) {
              reportPerformanceIssue('long_task', entry.duration, 500);
            }
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch {
      // Long task observer not supported
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };

        if (lastEntry && lastEntry.startTime > 4000) {
          reportPerformanceIssue('lcp', lastEntry.startTime, 4000);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // LCP observer not supported
    }
  }

  // Console error interception
  const originalConsoleError = console.error;
  console.error = function (...args) {
    // Add to breadcrumbs
    const message = args
      .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg).slice(0, 200) : String(arg)))
      .join(' ')
      .slice(0, 500);

    addBreadcrumb({
      type: 'console',
      category: 'console',
      message: `console.error: ${message}`,
    });

    // Call original
    originalConsoleError.apply(console, args);
  };

  // Retry pending errors on page load
  retryPendingErrors();

  // Also retry when online status changes
  window.addEventListener('online', () => {
    retryPendingErrors();
  });

  console.log('[Error Monitoring] Global error handling initialized');
}

/**
 * Set user context when user logs in
 */
export function setUserContextForErrors(user: {
  id: string;
  email?: string;
  subscriptionTier?: string;
}): void {
  setErrorUserContext({
    userId: user.id,
    userEmail: user.email,
    userTier: user.subscriptionTier,
  });
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeErrorHandling);
  } else {
    initializeErrorHandling();
  }
}
