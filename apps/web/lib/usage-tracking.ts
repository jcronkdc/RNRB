/**
 * Usage Tracking & Rate Limiting for Rock N' Roll Basement
 *
 * CRITICAL: Protects profit margins by enforcing tier-based usage limits
 *
 * SINGLE SOURCE OF TRUTH - Must match subscription-access.ts
 *
 * Pricing & Margins:
 * - Free ($0): $0 cost → 100% margin
 * - Creator ($9.99): ~$0.28 cost → 97% margin
 * - Studio ($29.99): ~$3.33 cost → 89% margin
 *
 * Features:
 * - Monthly AI request tracking
 * - Video call minute tracking
 * - Automatic period reset
 * - Tier-based limits
 */

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

// Usage limits per tier (monthly) - MUST MATCH subscription-access.ts
export const TIER_LIMITS = {
  free: {
    aiRequests: 0, // No AI for free tier
    videoMinutes: 0, // No video for free tier
    videoParticipantMinutes: 0, // No video
    assistantConversations: 0, // No assistant for free tier
    imageCredits: 0, // No album art AI for free tier
    collaborators: 1, // 1 collaborator max
    projects: 3, // 3 projects max
    storageGB: 1, // 1 GB storage
    maxVideoParticipants: 0, // No video
  },
  creator: {
    aiRequests: 100, // 100 AI assists/month (~$0.15 cost)
    videoMinutes: 0, // No video for Creator tier
    videoParticipantMinutes: 0, // No video
    assistantConversations: 30, // 30 assistant conversations (~$0.90 cost)
    imageCredits: 10, // 10 album art generations/month (~$0.03 cost)
    collaborators: 5, // 5 collaborators per project
    projects: 10, // 10 projects max
    storageGB: 10, // 10 GB storage
    maxVideoParticipants: 0, // No video
  },
  studio: {
    aiRequests: 500, // 500 AI assists/month (~$0.75 cost)
    videoMinutes: 1200, // 20 hours/month = 1200 min
    videoParticipantMinutes: 3600, // ACTUAL LIMIT: 3600 participant-minutes (~$14.40 cost)
    // Allows: 20hr with 3 people, or 10hr with 6 people
    assistantConversations: 100, // 100 assistant conversations (~$3.00 cost)
    imageCredits: 50, // 50 album art generations/month (~$0.15 cost)
    collaborators: -1, // Unlimited collaborators
    projects: -1, // Unlimited projects
    storageGB: 100, // 100 GB storage
    maxVideoParticipants: 10, // Cap per call to prevent runaway costs
  },
} as const;

export type TierName = keyof typeof TIER_LIMITS;
export type UsageType = 'aiRequests' | 'videoMinutes' | 'assistantConversations' | 'imageCredits';

interface UsageStatus {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  resetDate: Date;
  tier: TierName;
  error?: string;
}

/**
 * Get current usage status for a user
 */
export async function getUserUsage(userId: string, type: UsageType): Promise<UsageStatus> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        aiRequestsUsed: true,
        videoMinutesUsed: true,
        assistantConversationsUsed: true,
        imageCreditsUsed: true,
        aiRequestsBonus: true,
        videoMinutesBonus: true,
        imageCreditsBonus: true,
        storageBonusGB: true,
        usagePeriodStart: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Determine effective tier (expired subscriptions fall back to free)
    const tier = (
      user.subscriptionStatus === 'active' ? user.subscriptionTier : 'free'
    ) as TierName;

    // Check if usage period needs reset (monthly)
    const now = new Date();
    const periodStart = user.usagePeriodStart || now;
    const daysSincePeriodStart = Math.floor(
      (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Reset usage if 30+ days have passed
    if (daysSincePeriodStart >= 30) {
      await db.user.update({
        where: { id: userId },
        data: {
          aiRequestsUsed: 0,
          videoMinutesUsed: 0,
          assistantConversationsUsed: 0,
          imageCreditsUsed: 0,
          aiRequestsBonus: 0,
          videoMinutesBonus: 0,
          imageCreditsBonus: 0,
          usagePeriodStart: now,
        },
      });

      return {
        allowed: true,
        used: 0,
        limit: TIER_LIMITS[tier][type],
        remaining: TIER_LIMITS[tier][type],
        resetDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        tier,
      };
    }

    // Get current usage
    const used =
      type === 'aiRequests'
        ? user.aiRequestsUsed || 0
        : type === 'videoMinutes'
          ? user.videoMinutesUsed || 0
          : type === 'imageCredits'
            ? user.imageCreditsUsed || 0
            : user.assistantConversationsUsed || 0;

    const bonus =
      type === 'aiRequests'
        ? user.aiRequestsBonus || 0
        : type === 'videoMinutes'
          ? user.videoMinutesBonus || 0
          : type === 'imageCredits'
            ? user.imageCreditsBonus || 0
            : 0;

    const limit = TIER_LIMITS[tier][type] + bonus;
    const remaining = limit - used;
    const allowed = remaining > 0;

    return {
      allowed,
      used,
      limit,
      remaining,
      resetDate: new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000),
      tier,
      error: allowed ? undefined : `${type} limit exceeded. Upgrade to use more.`,
    };
  } catch (error) {
    console.error('Error checking usage:', error);
    throw error;
  }
}

/**
 * Check if user can make a request (throws error if not)
 */
export async function requireUsageQuota(type: UsageType, amount: number = 1): Promise<void> {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Authentication required');
  }

  const usage = await getUserUsage(user.id, type);

  if (!usage.allowed || usage.remaining < amount) {
    const upgradeMessage =
      usage.tier === 'free'
        ? 'Upgrade to Creator or Studio plan'
        : usage.tier === 'creator'
          ? 'Upgrade to Studio plan'
          : 'Purchase additional credits';

    throw Object.assign(new Error(`${type} quota exceeded. ${upgradeMessage} for more.`), {
      code: 'QUOTA_EXCEEDED',
      tier: usage.tier,
      used: usage.used,
      limit: usage.limit,
      resetDate: usage.resetDate,
      requiresUpgrade: true,
    });
  }
}

/**
 * Track usage after successful request
 */
export async function trackUsage(
  userId: string,
  type: UsageType,
  amount: number = 1
): Promise<void> {
  try {
    const updateData =
      type === 'aiRequests'
        ? { aiRequestsUsed: { increment: amount } }
        : type === 'videoMinutes'
          ? { videoMinutesUsed: { increment: amount } }
          : type === 'imageCredits'
            ? { imageCreditsUsed: { increment: amount } }
            : { assistantConversationsUsed: { increment: amount } };

    await db.user.update({
      where: { id: userId },
      data: updateData,
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    // Don't throw - tracking failure shouldn't break the feature
  }
}

/**
 * Get usage summary for dashboard display
 */
export async function getUsageSummary(userId: string) {
  const [aiUsage, videoUsage, assistantUsage, imageUsage] = await Promise.all([
    getUserUsage(userId, 'aiRequests'),
    getUserUsage(userId, 'videoMinutes'),
    getUserUsage(userId, 'assistantConversations'),
    getUserUsage(userId, 'imageCredits'),
  ]);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      storageUsedGB: true,
      storageBonusGB: true,
      aiRequestsBonus: true,
      videoMinutesBonus: true,
      imageCreditsBonus: true,
    },
  });

  const tier = (user?.subscriptionStatus === 'active' ? user.subscriptionTier : 'free') as TierName;
  const storageBonus = Number(user?.storageBonusGB) || 0;
  const aiBonus = user?.aiRequestsBonus || 0;
  const videoBonus = user?.videoMinutesBonus || 0;
  const imageBonus = user?.imageCreditsBonus || 0;
  const storageLimit = TIER_LIMITS[tier].storageGB + storageBonus;

  return {
    tier,
    ai: {
      used: aiUsage.used,
      limit: aiUsage.limit,
      remaining: aiUsage.remaining,
      percentage: aiUsage.limit > 0 ? (aiUsage.used / aiUsage.limit) * 100 : 0,
      bonus: aiBonus,
    },
    video: {
      used: videoUsage.used,
      limit: videoUsage.limit,
      remaining: videoUsage.remaining,
      percentage: videoUsage.limit > 0 ? (videoUsage.used / videoUsage.limit) * 100 : 0,
      bonus: videoBonus,
    },
    assistant: {
      used: assistantUsage.used,
      limit: assistantUsage.limit,
      remaining: assistantUsage.remaining,
      percentage: assistantUsage.limit > 0 ? (assistantUsage.used / assistantUsage.limit) * 100 : 0,
    },
    image: {
      used: imageUsage.used,
      limit: imageUsage.limit,
      remaining: imageUsage.remaining,
      percentage: imageUsage.limit > 0 ? (imageUsage.used / imageUsage.limit) * 100 : 0,
      bonus: imageBonus,
    },
    storage: {
      used: Number(user?.storageUsedGB) || 0,
      limit: storageLimit,
      remaining: storageLimit - (Number(user?.storageUsedGB) || 0),
      percentage: storageLimit > 0 ? ((Number(user?.storageUsedGB) || 0) / storageLimit) * 100 : 0,
      bonus: storageBonus,
    },
    resetDate: aiUsage.resetDate,
  };
}
