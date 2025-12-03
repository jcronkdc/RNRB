/**
 * ERROR MONITORING SYSTEM
 *
 * Comprehensive bug detection and reporting for the platform.
 * Captures client-side errors, API errors, network failures, and performance issues.
 * Reports critical issues to admin in real-time.
 */

import { trackEvent } from './posthog';

// Error severity levels
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// Error categories for better organization
export type ErrorCategory =
  | 'javascript'
  | 'react'
  | 'api'
  | 'network'
  | 'performance'
  | 'security'
  | 'validation'
  | 'unknown';

// Error report structure
export interface ErrorReport {
  id?: string;
  timestamp: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  route?: string;
  userAgent: string;
  userId?: string;
  userEmail?: string;
  userTier?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  breadcrumbs?: Breadcrumb[];
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

// Breadcrumb for tracking user actions before error
export interface Breadcrumb {
  timestamp: string;
  type: 'navigation' | 'click' | 'xhr' | 'console' | 'custom';
  category: string;
  message: string;
  data?: Record<string, unknown>;
}

// In-memory breadcrumb storage (circular buffer)
const MAX_BREADCRUMBS = 50;
let breadcrumbs: Breadcrumb[] = [];

// Debounce map to prevent duplicate error reports
const recentErrors = new Map<string, number>();
const ERROR_DEBOUNCE_MS = 5000; // Don't report same error within 5 seconds

/**
 * Generate error fingerprint for deduplication
 */
function generateErrorFingerprint(error: Error | string, url: string): string {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'object' && error.stack ? error.stack.split('\n')[0] : '';
  return `${message}|${stack}|${url}`;
}

/**
 * Add a breadcrumb to track user actions
 */
export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const entry: Breadcrumb = {
    ...breadcrumb,
    timestamp: new Date().toISOString(),
  };

  breadcrumbs.push(entry);

  // Keep only the last MAX_BREADCRUMBS
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs = breadcrumbs.slice(-MAX_BREADCRUMBS);
  }
}

/**
 * Determine error severity based on context
 */
function determineSeverity(error: Error | string, category: ErrorCategory): ErrorSeverity {
  const message = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();

  // Critical errors
  if (
    message.includes('cannot read') ||
    message.includes('is not defined') ||
    message.includes('cannot access') ||
    message.includes('chunk load') ||
    category === 'security'
  ) {
    return 'critical';
  }

  // High severity
  if (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('500') ||
    message.includes('503')
  ) {
    return 'high';
  }

  // Medium severity
  if (
    message.includes('400') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('404') ||
    category === 'api'
  ) {
    return 'medium';
  }

  // Low severity
  if (message.includes('warning') || category === 'validation') {
    return 'low';
  }

  return 'medium';
}

/**
 * Determine error category based on error type
 */
function determineCategory(error: Error | string, source?: string): ErrorCategory {
  const message = typeof error === 'string' ? error.toLowerCase() : error.message.toLowerCase();
  const errorName = typeof error === 'object' ? error.name : '';

  if (source === 'react' || errorName === 'React' || message.includes('react')) {
    return 'react';
  }

  if (message.includes('fetch') || message.includes('xhr') || message.includes('api')) {
    return 'api';
  }

  if (message.includes('network') || message.includes('connection')) {
    return 'network';
  }

  if (message.includes('slow') || message.includes('performance') || message.includes('timeout')) {
    return 'performance';
  }

  if (
    message.includes('auth') ||
    message.includes('permission') ||
    message.includes('unauthorized')
  ) {
    return 'security';
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }

  if (errorName === 'TypeError' || errorName === 'ReferenceError' || errorName === 'SyntaxError') {
    return 'javascript';
  }

  return 'unknown';
}

/**
 * Get current user context for error reports
 */
async function getUserContext(): Promise<{
  userId?: string;
  userEmail?: string;
  userTier?: string;
}> {
  if (typeof window === 'undefined') return {};

  try {
    // Try to get user from session storage or window
    const sessionData = sessionStorage.getItem('user-context');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
  } catch {
    // Ignore parsing errors
  }

  return {};
}

/**
 * Report an error to the monitoring system
 */
export async function reportError(
  error: Error | string,
  options: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    componentStack?: string;
    metadata?: Record<string, unknown>;
    skipAnalytics?: boolean;
  } = {}
): Promise<void> {
  if (typeof window === 'undefined') return;

  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'object' ? error.stack : undefined;
  const url = window.location.href;

  // Generate fingerprint and check for duplicates
  const fingerprint = generateErrorFingerprint(error, url);
  const lastReported = recentErrors.get(fingerprint);
  const now = Date.now();

  if (lastReported && now - lastReported < ERROR_DEBOUNCE_MS) {
    // Skip duplicate error within debounce window
    return;
  }

  recentErrors.set(fingerprint, now);

  // Clean up old entries from debounce map
  if (recentErrors.size > 100) {
    const cutoff = now - ERROR_DEBOUNCE_MS;
    recentErrors.forEach((time, key) => {
      if (time < cutoff) {
        recentErrors.delete(key);
      }
    });
  }

  const category = options.category || determineCategory(error);
  const severity = options.severity || determineSeverity(error, category);
  const userContext = await getUserContext();

  const report: ErrorReport = {
    timestamp: new Date().toISOString(),
    severity,
    category,
    message,
    stack,
    componentStack: options.componentStack,
    url,
    route: window.location.pathname,
    userAgent: navigator.userAgent,
    ...userContext,
    sessionId: getSessionId(),
    metadata: options.metadata,
    breadcrumbs: [...breadcrumbs],
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🐛 Error Report [${severity.toUpperCase()}]`);
    console.error('Message:', message);
    console.log('Category:', category);
    console.log('URL:', url);
    if (stack) console.log('Stack:', stack);
    if (options.componentStack) console.log('Component Stack:', options.componentStack);
    console.log('Breadcrumbs:', breadcrumbs.slice(-10));
    console.groupEnd();
  }

  // Track in PostHog for analytics (unless skipped)
  if (!options.skipAnalytics) {
    trackEvent('error_reported', {
      severity,
      category,
      message: message.slice(0, 200), // Truncate for PostHog
      url,
      route: window.location.pathname,
    });
  }

  // Send to API
  try {
    await fetch('/api/admin/error-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
  } catch (fetchError) {
    // If API fails, store locally for retry
    storeErrorLocally(report);
    console.warn('Failed to send error report to API, stored locally');
  }

  // For critical/high severity, try to notify admin immediately
  if (severity === 'critical' || severity === 'high') {
    notifyAdminRealtime(report);
  }
}

/**
 * Store error locally if API is unavailable
 */
function storeErrorLocally(report: ErrorReport): void {
  try {
    const stored = localStorage.getItem('pending-error-reports');
    const pending: ErrorReport[] = stored ? JSON.parse(stored) : [];
    pending.push(report);

    // Keep only last 20 pending reports
    if (pending.length > 20) {
      pending.shift();
    }

    localStorage.setItem('pending-error-reports', JSON.stringify(pending));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Retry sending locally stored errors
 */
export async function retryPendingErrors(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem('pending-error-reports');
    if (!stored) return;

    const pending: ErrorReport[] = JSON.parse(stored);
    if (pending.length === 0) return;

    // Try to send each pending error
    const remaining: ErrorReport[] = [];
    for (const report of pending) {
      try {
        await fetch('/api/admin/error-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      } catch {
        remaining.push(report);
      }
    }

    // Update local storage with remaining errors
    if (remaining.length > 0) {
      localStorage.setItem('pending-error-reports', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('pending-error-reports');
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Send real-time notification for critical errors
 */
async function notifyAdminRealtime(report: ErrorReport): Promise<void> {
  try {
    await fetch('/api/admin/error-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'critical_error',
        title: `${report.severity.toUpperCase()}: ${report.category} Error`,
        message: report.message.slice(0, 500),
        url: report.url,
        timestamp: report.timestamp,
      }),
    });
  } catch {
    // Don't fail silently for critical errors in dev
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to send real-time admin notification');
    }
  }
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('error-session-id');
  if (!sessionId) {
    sessionId = `err_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem('error-session-id', sessionId);
  }
  return sessionId;
}

/**
 * Report a React error boundary catch
 */
export function reportReactError(error: Error, errorInfo: React.ErrorInfo): void {
  reportError(error, {
    category: 'react',
    componentStack: errorInfo.componentStack || undefined,
    metadata: {
      componentStack: errorInfo.componentStack,
    },
  });
}

/**
 * Report an API error
 */
export function reportApiError(
  endpoint: string,
  method: string,
  status: number,
  message: string,
  responseBody?: unknown
): void {
  reportError(message, {
    category: 'api',
    severity: status >= 500 ? 'high' : 'medium',
    metadata: {
      endpoint,
      method,
      status,
      responseBody: responseBody ? JSON.stringify(responseBody).slice(0, 500) : undefined,
    },
  });
}

/**
 * Report a network error
 */
export function reportNetworkError(url: string, error: Error | string): void {
  reportError(error, {
    category: 'network',
    severity: 'high',
    metadata: { failedUrl: url },
  });
}

/**
 * Report a performance issue
 */
export function reportPerformanceIssue(metric: string, value: number, threshold: number): void {
  reportError(`Performance issue: ${metric} = ${value}ms (threshold: ${threshold}ms)`, {
    category: 'performance',
    severity: value > threshold * 2 ? 'high' : 'medium',
    metadata: { metric, value, threshold },
    skipAnalytics: true, // Performance is tracked separately
  });
}

/**
 * Set user context for error reports
 */
export function setErrorUserContext(context: {
  userId: string;
  userEmail?: string;
  userTier?: string;
}): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem('user-context', JSON.stringify(context));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear user context (on logout)
 */
export function clearErrorUserContext(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem('user-context');
  } catch {
    // Ignore storage errors
  }
}

// Export for testing
export const _internal = {
  generateErrorFingerprint,
  determineSeverity,
  determineCategory,
  breadcrumbs,
  recentErrors,
};
