/**
 * Subscription Access Control Utility
 * 
 * Centralized logic for checking subscription tiers and feature access.
 * Follows the Tokyo Ant principle: verify before allowing passage.
 */

import { db } from '@/lib/db';

export type SubscriptionTier = 'free' | 'creator' | 'studio';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  isActive: boolean;
  features: FeatureAccess;
}

export interface FeatureAccess {
  setlistManagement: boolean;
  toursAndGigs: boolean;
  advancedAnalytics: boolean;
  unlimitedProjects: boolean;
  liveCollaboration: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  aiCreditsPerMonth: number;
  maxProjectCount: number;
  storageGB: number;
  videoMinutesPerMonth: number;
}

/**
 * Feature access matrix based on subscription tiers
 */
const TIER_FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    setlistManagement: false,
    toursAndGigs: false,
    advancedAnalytics: false,
    unlimitedProjects: false,
    liveCollaboration: false,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    aiCreditsPerMonth: 10,
    maxProjectCount: 1,
    storageGB: 1,
    videoMinutesPerMonth: 0,
  },
  creator: {
    setlistManagement: true,
    toursAndGigs: true,
    advancedAnalytics: true,
    unlimitedProjects: true,
    liveCollaboration: true,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
    aiCreditsPerMonth: 500,
    maxProjectCount: -1, // unlimited
    storageGB: 50,
    videoMinutesPerMonth: 120,
  },
  studio: {
    setlistManagement: true,
    toursAndGigs: true,
    advancedAnalytics: true,
    unlimitedProjects: true,
    liveCollaboration: true,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
    aiCreditsPerMonth: -1, // unlimited
    maxProjectCount: -1, // unlimited
    storageGB: 500,
    videoMinutesPerMonth: -1, // unlimited
  },
};

/**
 * Get subscription info for a user
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const tier = (user.subscriptionTier || 'free') as SubscriptionTier;
  const status = user.subscriptionStatus as SubscriptionStatus | null;

  // Check if subscription is actually active
  const isActive = 
    tier !== 'free' && 
    (status === 'active' || status === 'trialing') &&
    (!user.subscriptionEndsAt || new Date(user.subscriptionEndsAt) > new Date());

  // If subscription is not active but tier is set, downgrade to free
  const effectiveTier = isActive ? tier : 'free';

  return {
    tier: effectiveTier,
    status,
    isActive,
    features: TIER_FEATURES[effectiveTier],
  };
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: keyof FeatureAccess
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  const featureValue = subscription.features[feature];
  
  // For boolean features, return as-is
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }
  
  // For numeric features, return true if > 0 or -1 (unlimited)
  return featureValue === -1 || featureValue > 0;
}

/**
 * Require specific feature access or throw error
 */
export async function requireFeatureAccess(
  userId: string,
  feature: keyof FeatureAccess,
  customMessage?: string
): Promise<void> {
  const hasAccess = await hasFeatureAccess(userId, feature);
  
  if (!hasAccess) {
    const message = customMessage || `This feature requires a paid subscription. Please upgrade your account.`;
    throw new SubscriptionError(message, feature);
  }
}

/**
 * Get minimum tier required for a feature
 */
export function getRequiredTier(feature: keyof FeatureAccess): SubscriptionTier | null {
  // Check each tier from lowest to highest
  const tiers: SubscriptionTier[] = ['free', 'creator', 'studio'];
  
  for (const tier of tiers) {
    const featureValue = TIER_FEATURES[tier][feature];
    
    if (typeof featureValue === 'boolean' && featureValue === true) {
      return tier;
    }
    if (typeof featureValue === 'number' && (featureValue > 0 || featureValue === -1)) {
      return tier;
    }
  }
  
  return null;
}

/**
 * Get feature limits for a user
 */
export async function getFeatureLimits(userId: string) {
  const subscription = await getUserSubscription(userId);
  
  // Get current usage
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      aiRequestsUsed: true,
      videoMinutesUsed: true,
      storageUsedGB: true,
      usagePeriodStart: true,
      memberships: {
        select: {
          org: {
            select: {
              projects: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Count total projects across all orgs
  const projectCount = user.memberships.reduce(
    (total, membership) => total + membership.org.projects.length,
    0
  );

  return {
    tier: subscription.tier,
    isActive: subscription.isActive,
    limits: {
      projects: {
        current: projectCount,
        max: subscription.features.maxProjectCount,
        unlimited: subscription.features.maxProjectCount === -1,
      },
      aiCredits: {
        current: user.aiRequestsUsed || 0,
        max: subscription.features.aiCreditsPerMonth,
        unlimited: subscription.features.aiCreditsPerMonth === -1,
      },
      videoMinutes: {
        current: user.videoMinutesUsed || 0,
        max: subscription.features.videoMinutesPerMonth,
        unlimited: subscription.features.videoMinutesPerMonth === -1,
      },
      storage: {
        current: Number(user.storageUsedGB) || 0,
        max: subscription.features.storageGB,
        unlimited: subscription.features.storageGB === -1,
      },
    },
    periodStart: user.usagePeriodStart,
  };
}

/**
 * Custom error for subscription-related issues
 */
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public feature: keyof FeatureAccess,
    public requiredTier?: SubscriptionTier
  ) {
    super(message);
    this.name = 'SubscriptionError';
    this.requiredTier = requiredTier || getRequiredTier(feature) || 'creator';
  }
}

/**
 * Feature descriptions for upgrade prompts
 */
export const FEATURE_DESCRIPTIONS: Record<string, { title: string; description: string; icon: string }> = {
  setlistManagement: {
    title: 'Smart Setlist Management',
    description: 'AI-powered setlist generation, templates, and performance mode for live shows. Organize your songs by energy level, key, and duration.',
    icon: 'ListMusic',
  },
  toursAndGigs: {
    title: 'Tour & Gig Management',
    description: 'Track your shows, venues, and tour schedules. Manage load-ins, soundchecks, and setlists for each performance.',
    icon: 'Radio',
  },
  advancedAnalytics: {
    title: 'Advanced Analytics',
    description: 'Deep insights into your music career: streaming stats, revenue tracking, audience demographics, and growth trends.',
    icon: 'BarChart3',
  },
  liveCollaboration: {
    title: 'Live Collaboration',
    description: 'Real-time video sessions with your band. Co-write songs, jam remotely, and record together from anywhere.',
    icon: 'Users2',
  },
  customBranding: {
    title: 'Custom Branding',
    description: 'White-label your projects with custom logos, colors, and domain names. Perfect for labels and studios.',
    icon: 'Palette',
  },
  apiAccess: {
    title: 'API Access',
    description: 'Build custom integrations and automate workflows with our REST API. Perfect for power users and developers.',
    icon: 'Code',
  },
};

