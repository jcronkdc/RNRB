/**
 * Workshop Components
 *
 * The soul of Rock N' Roll Basement
 * These components work together to create a warm, inviting experience
 * that makes musicians feel at home.
 */

// Empty states that inspire, not discourage
export { EmptyState, EmptyStateInline } from './empty-state';

// Daily ritual - "a reason to return"
export { DailySpark, SparkIndicator } from './daily-spark';

// Warm welcome - the first thing you see
export { WorkshopWelcome } from './workshop-welcome';

// Page header - standardized header with logo for all pages
export { WorkshopPageHeader, WorkshopPageLoading } from './page-header';

// Re-export the voice utilities for convenience
export {
  getWelcomeMessage,
  emptyStates,
  getDailySpark,
  microCopy,
  getEmptyState,
} from '@/lib/workshop-voice';
