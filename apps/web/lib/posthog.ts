import posthog from 'posthog-js';

/**
 * PostHog Analytics Utilities
 *
 * This module provides typed, easy-to-use functions for tracking events in PostHog.
 * Import these functions to track user actions throughout your app.
 */

// Event types for type safety
export const PostHogEvents = {
  // User Actions
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',

  // Project Actions
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_SHARED: 'project_shared',

  // Song/Track Actions
  SONG_CREATED: 'song_created',
  SONG_UPDATED: 'song_updated',
  SONG_DELETED: 'song_deleted',
  TRACK_UPLOADED: 'track_uploaded',
  TRACK_PLAYED: 'track_played',

  // Collaboration
  COLLABORATION_STARTED: 'collaboration_started',
  MESSAGE_SENT: 'message_sent',
  COMMENT_ADDED: 'comment_added',

  // Tours & Gigs
  TOUR_CREATED: 'tour_created',
  GIG_ADDED: 'gig_added',
  SETLIST_GENERATED: 'setlist_generated',

  // AI Features
  AI_ASSISTANT_USED: 'ai_assistant_used',
  SONGWRITING_AI_USED: 'songwriting_ai_used',

  // Studio/Recording
  RECORDING_STARTED: 'recording_started',
  RECORDING_COMPLETED: 'recording_completed',

  // Billing
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
} as const;

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.capture(eventName, properties);
}

/**
 * Identify a user - call this after login
 */
export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    plan?: string;
    [key: string]: any;
  }
) {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.identify(userId, properties);
}

/**
 * Reset user identity - call this on logout
 */
export function resetUser() {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.reset();
}

/**
 * Track a page view manually (auto-capture is enabled, so usually not needed)
 */
export function trackPageView(pageName?: string) {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.capture('$pageview', {
    $current_url: window.location.href,
    page_name: pageName,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.people.set(properties);
}

/**
 * Track feature flag viewed
 */
export function trackFeatureFlag(flagKey: string, flagValue: any) {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.capture('$feature_flag_called', {
    $feature_flag: flagKey,
    $feature_flag_response: flagValue,
  });
}

/**
 * Check if PostHog is loaded
 */
export function isPostHogLoaded(): boolean {
  return typeof window !== 'undefined' && posthog.__loaded;
}

/**
 * Get current distinct ID
 */
export function getDistinctId(): string | undefined {
  if (!isPostHogLoaded()) return undefined;
  return posthog.get_distinct_id();
}

/**
 * Start a recording session
 */
export function startSessionRecording() {
  if (!isPostHogLoaded()) return;
  posthog.startSessionRecording();
}

/**
 * Stop a recording session
 */
export function stopSessionRecording() {
  if (!isPostHogLoaded()) return;
  posthog.stopSessionRecording();
}

// Export the posthog instance for advanced use cases
export { posthog };
