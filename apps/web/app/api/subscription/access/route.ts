/**
 * Subscription Access Check API
 *
 * Returns the user's subscription tier and feature access
 * Used by client components to determine what to show/hide
 */

import { NextResponse } from 'next/server';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/subscription-access';

export const runtime = 'nodejs';

// Feature to tier mapping for premium features
const FEATURE_REQUIREMENTS: Record<string, SubscriptionTier> = {
  // Creator tier features
  aiChatAssist: 'creator',
  aiTranscription: 'creator',
  aiContentGeneration: 'creator',
  aiTourRouter: 'creator',
  aiMusicGeneration: 'creator',
  setlistManagement: 'creator',
  advancedAnalytics: 'creator',

  // Studio tier features
  aiAssistant: 'studio',
  videoCalls: 'studio',
  unlimitedProjects: 'studio',
  unlimitedCollaborators: 'studio',
  prioritySupport: 'studio',
};

/**
 * GET /api/subscription/access
 * Returns user's subscription status and feature access
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        tier: 'free',
        tierName: 'Explorer',
        features: SUBSCRIPTION_TIERS.free.features,
      });
    }

    // Get user's subscription info from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        aiRequestsUsed: true,
        videoMinutesUsed: true,
        assistantConversationsUsed: true,
        storageUsedGB: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        authenticated: true,
        tier: 'free',
        tierName: 'Explorer',
        features: SUBSCRIPTION_TIERS.free.features,
      });
    }

    // Determine effective tier
    let effectiveTier: SubscriptionTier = 'free';

    if (
      user.subscriptionStatus === 'active' &&
      user.subscriptionTier &&
      user.subscriptionTier in SUBSCRIPTION_TIERS
    ) {
      // Check if subscription hasn't expired
      if (!user.subscriptionEndsAt || new Date() <= user.subscriptionEndsAt) {
        effectiveTier = user.subscriptionTier as SubscriptionTier;
      }
    }

    const tierConfig = SUBSCRIPTION_TIERS[effectiveTier];

    // Build feature access map
    const featureAccess: Record<string, boolean> = {};
    for (const [feature, requiredTier] of Object.entries(FEATURE_REQUIREMENTS)) {
      const tierOrder: SubscriptionTier[] = ['free', 'creator', 'studio'];
      const userTierIndex = tierOrder.indexOf(effectiveTier);
      const requiredTierIndex = tierOrder.indexOf(requiredTier);
      featureAccess[feature] = userTierIndex >= requiredTierIndex;
    }

    return NextResponse.json({
      authenticated: true,
      tier: effectiveTier,
      tierName: tierConfig.name,
      features: tierConfig.features,
      featureAccess,
      usage: {
        aiRequests: {
          used: user.aiRequestsUsed || 0,
          limit: tierConfig.features.aiRequestsLimit,
        },
        videoMinutes: {
          used: user.videoMinutesUsed || 0,
          limit: tierConfig.features.videoMinutesLimit,
        },
        storage: {
          used: Number(user.storageUsedGB) || 0,
          limit: tierConfig.features.storageGB,
        },
      },
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndsAt: user.subscriptionEndsAt,
    });
  } catch (error) {
    console.error('Subscription access check error:', error);
    return NextResponse.json({ error: 'Failed to check subscription' }, { status: 500 });
  }
}

/**
 * POST /api/subscription/access
 * Check access to a specific feature
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { feature } = body;

    if (!feature) {
      return NextResponse.json({ error: 'Feature name required' }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({
        hasAccess: false,
        tier: 'free',
        reason: 'Authentication required',
        requiredTier: FEATURE_REQUIREMENTS[feature] || 'creator',
      });
    }

    // Get user's subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    // Determine effective tier
    let effectiveTier: SubscriptionTier = 'free';

    if (
      user?.subscriptionStatus === 'active' &&
      user.subscriptionTier &&
      user.subscriptionTier in SUBSCRIPTION_TIERS
    ) {
      if (!user.subscriptionEndsAt || new Date() <= user.subscriptionEndsAt) {
        effectiveTier = user.subscriptionTier as SubscriptionTier;
      }
    }

    // Check access
    const requiredTier = FEATURE_REQUIREMENTS[feature] || 'creator';
    const tierOrder: SubscriptionTier[] = ['free', 'creator', 'studio'];
    const userTierIndex = tierOrder.indexOf(effectiveTier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    const hasAccess = userTierIndex >= requiredTierIndex;

    return NextResponse.json({
      hasAccess,
      tier: effectiveTier,
      tierName: SUBSCRIPTION_TIERS[effectiveTier].name,
      requiredTier,
      requiredTierName: SUBSCRIPTION_TIERS[requiredTier].name,
      reason: hasAccess
        ? undefined
        : `This feature requires ${SUBSCRIPTION_TIERS[requiredTier].name} plan`,
    });
  } catch (error) {
    console.error('Feature access check error:', error);
    return NextResponse.json({ error: 'Failed to check feature access' }, { status: 500 });
  }
}
