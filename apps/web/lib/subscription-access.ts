import { prisma } from '@cronkwaters/db';

import { getCurrentUser } from '@/lib/session';

/**
 * Subscription tier definitions with feature access
 */
/**
 * SINGLE SOURCE OF TRUTH FOR SUBSCRIPTION TIERS
 *
 * Pricing (for good margins):
 * - Free: $0/mo → Cost: $0 → 100% margin
 * - Creator: $9.99/mo → Cost: ~$0.28/user → 97% margin
 * - Studio: $29.99/mo → Cost: ~$3.33/user → 89% margin
 */
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Explorer',
    price: 0,
    features: {
      aiChatAssist: false,
      aiTranscription: false,
      aiContentGeneration: false,
      aiTourRouter: false,
      aiAssistant: false,
      aiAlbumArt: false, // AI artwork generation
      videoCalls: false,
      collaborationLimit: 1, // Max 1 collaborator per project
      projectLimit: 3,
      storageGB: 1,
      aiRequestsLimit: 0,
      videoMinutesLimit: 0,
      videoParticipantMinutesLimit: 0,
      imageCreditsLimit: 0, // No album art for free tier
      maxVideoParticipants: 0,
    },
  },
  creator: {
    name: 'Creator',
    price: 14.99,
    features: {
      aiChatAssist: true,
      aiTranscription: true,
      aiContentGeneration: true,
      aiTourRouter: true,
      aiAssistant: false, // Requires add-on or Studio tier
      aiAlbumArt: true, // AI artwork generation enabled
      videoCalls: false, // Video only in Studio tier
      collaborationLimit: 5,
      projectLimit: 10,
      storageGB: 10,
      aiRequestsLimit: 100, // 100 AI assists/month
      videoMinutesLimit: 0,
      videoParticipantMinutesLimit: 0,
      imageCreditsLimit: 10, // 10 album art generations/month (~$0.03 cost)
      maxVideoParticipants: 0,
    },
  },
  studio: {
    name: 'Studio',
    price: 29.99,
    features: {
      aiChatAssist: true,
      aiTranscription: true,
      aiContentGeneration: true,
      aiTourRouter: true,
      aiAssistant: true, // Included in Studio
      aiAlbumArt: true, // AI artwork generation enabled
      videoCalls: true,
      collaborationLimit: -1, // Unlimited
      projectLimit: -1, // Unlimited
      storageGB: 100,
      aiRequestsLimit: 500, // 500 AI assists/month
      videoMinutesLimit: 1200, // Legacy: simple hour tracking
      videoParticipantMinutesLimit: 3600, // REAL LIMIT: 3600 participant-minutes (~$14.40 cost cap)
      imageCreditsLimit: 50, // 50 album art generations/month (~$0.15 cost)
      maxVideoParticipants: 10, // Max per call to prevent runaway costs
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
export type FeatureName = keyof typeof SUBSCRIPTION_TIERS.free.features;

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  featureName: FeatureName
): Promise<{ hasAccess: boolean; tier: SubscriptionTier; reason?: string }> {
  try {
    // Get current authenticated user from NextAuth session
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        hasAccess: false,
        tier: 'free',
        reason: 'Not authenticated',
      };
    }

    // Get user from database with subscription info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    if (!dbUser) {
      return {
        hasAccess: false,
        tier: 'free',
        reason: 'User not found in database',
      };
    }

    // Determine effective tier
    const tier = getEffectiveTier(dbUser);

    // Check if tier includes feature
    const features = SUBSCRIPTION_TIERS[tier].features;
    const hasAccess = features[featureName] === true || features[featureName] === -1;

    return {
      hasAccess,
      tier,
      reason: hasAccess
        ? undefined
        : `Feature requires ${tier === 'free' ? 'Creator or Studio' : 'Studio'} plan`,
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      hasAccess: false,
      tier: 'free',
      reason: 'Access check failed',
    };
  }
}

/**
 * Get effective subscription tier based on status and dates
 */
function getEffectiveTier(user: {
  subscriptionTier: string;
  subscriptionStatus: string | null;
  subscriptionEndsAt: Date | null;
}): SubscriptionTier {
  // If subscription is not active, downgrade to free
  if (!user.subscriptionStatus || user.subscriptionStatus !== 'active') {
    return 'free';
  }

  // If subscription has ended, downgrade to free
  if (user.subscriptionEndsAt && new Date() > user.subscriptionEndsAt) {
    return 'free';
  }

  // Validate tier is one of the known tiers
  const tier = user.subscriptionTier as SubscriptionTier;
  if (tier in SUBSCRIPTION_TIERS) {
    return tier;
  }

  // Default to free if tier is invalid
  return 'free';
}

/**
 * Require feature access - throws error if not authorized
 * Use this in API routes
 */
export async function requireFeatureAccess(
  featureName: FeatureName
): Promise<{ tier: SubscriptionTier }> {
  const result = await hasFeatureAccess(featureName);

  if (!result.hasAccess) {
    const error = new Error(result.reason || 'You do not have access to this feature') as Error & {
      statusCode: number;
      tier: SubscriptionTier;
    };
    error.statusCode = 403;
    error.tier = result.tier;
    throw error;
  }

  return { tier: result.tier };
}

/**
 * Get user's current subscription tier
 */
export async function getUserTier(): Promise<SubscriptionTier> {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return 'free';
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    if (!dbUser) {
      return 'free';
    }

    return getEffectiveTier(dbUser);
  } catch (error) {
    console.error('Error getting user tier:', error);
    return 'free';
  }
}

/**
 * Check if user has access to AI features (convenience function)
 */
export async function hasAIAccess(): Promise<boolean> {
  const result = await hasFeatureAccess('aiChatAssist');
  return result.hasAccess;
}

/**
 * Check if user can add more collaborators
 */
export async function canAddCollaborator(
  currentCollaboratorCount: number
): Promise<{ canAdd: boolean; limit: number; tier: SubscriptionTier }> {
  try {
    const tier = await getUserTier();
    const limit = SUBSCRIPTION_TIERS[tier].features.collaborationLimit;

    // -1 means unlimited
    if (limit === -1) {
      return { canAdd: true, limit, tier };
    }

    return {
      canAdd: currentCollaboratorCount < limit,
      limit,
      tier,
    };
  } catch (error) {
    console.error('Error checking collaborator limit:', error);
    return { canAdd: false, limit: 1, tier: 'free' };
  }
}

/**
 * Check if user can create more projects
 */
export async function canCreateProject(
  currentProjectCount: number
): Promise<{ canCreate: boolean; limit: number; tier: SubscriptionTier }> {
  try {
    const tier = await getUserTier();
    const limit = SUBSCRIPTION_TIERS[tier].features.projectLimit;

    // -1 means unlimited
    if (limit === -1) {
      return { canCreate: true, limit, tier };
    }

    return {
      canCreate: currentProjectCount < limit,
      limit,
      tier,
    };
  } catch (error) {
    console.error('Error checking project limit:', error);
    return { canCreate: false, limit: 3, tier: 'free' };
  }
}
