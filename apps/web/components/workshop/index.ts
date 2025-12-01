/**
 * Workshop Components
 *
 * The soul of Rock N' Roll Basement
 * These components work together to create a warm, inviting experience
 * that makes musicians feel at home.
 */

// Empty states that inspire, not discourage
export { EmptyState, EmptyStateInline } from './empty-state';

// Community presence - "you're not alone"
export { CommunityPulse, PulseIndicator } from './community-pulse';

// Continuity - "we remember where you left off"
export { ContinueWhereYouLeftOff } from './continue-where-you-left-off';

// Progress - "you're becoming the musician you want to be"
export { YourJourney } from './your-journey';

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
  milestoneMessages,
  journeyMilestones,
  getDailySpark,
  microCopy,
  getCommunityMessage,
  getEmptyState,
  getMilestoneMessage,
} from '@/lib/workshop-voice';
