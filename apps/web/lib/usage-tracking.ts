/**
 * Usage Tracking & Rate Limiting for Rock N' Roll Basement
 *
 * CRITICAL: Protects profit margins by enforcing tier-based usage limits
 *
 * Features:
 * - Monthly AI request tracking
 * - Video call minute tracking
 * - Automatic period reset
 * - Tier-based limits
 */

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/supabase';

// Usage limits per tier (monthly)
export const TIER_LIMITS = {
  free: {
    aiRequests: 0,
    videoMinutes: 0,
    collaborators: 1,
    projects: 3,
    storageGB: 1,
  },
  creator: {
    aiRequests: 100, // ~$0.15/month at optimized model rates
    videoMinutes: 0, // No video for Creator tier
    collaborators: 5,
    projects: 10,
    storageGB: 10,
  },
  studio: {
    aiRequests: 500, // ~$0.75/month at optimized model rates
    videoMinutes: 1200, // 20 hours/month (~$2.40 at scale pricing)
    collaborators: -1, // Unlimited
    projects: -1, // Unlimited
    storageGB: 100,
  },
} as const;

export type TierName = keyof typeof TIER_LIMITS;
export type UsageType = 'aiRequests' | 'videoMinutes';

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
    const used = type === 'aiRequests' ? user.aiRequestsUsed || 0 : user.videoMinutesUsed || 0;

    const limit = TIER_LIMITS[tier][type];
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
  if (!user) {
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
        : { videoMinutesUsed: { increment: amount } };

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
  const [aiUsage, videoUsage] = await Promise.all([
    getUserUsage(userId, 'aiRequests'),
    getUserUsage(userId, 'videoMinutes'),
  ]);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      storageUsedGB: true,
    },
  });

  const tier = (user?.subscriptionStatus === 'active' ? user.subscriptionTier : 'free') as TierName;

  return {
    tier,
    ai: {
      used: aiUsage.used,
      limit: aiUsage.limit,
      remaining: aiUsage.remaining,
      percentage: aiUsage.limit > 0 ? (aiUsage.used / aiUsage.limit) * 100 : 0,
    },
    video: {
      used: videoUsage.used,
      limit: videoUsage.limit,
      remaining: videoUsage.remaining,
      percentage: videoUsage.limit > 0 ? (videoUsage.used / videoUsage.limit) * 100 : 0,
    },
    storage: {
      used: Number(user?.storageUsedGB) || 0,
      limit: TIER_LIMITS[tier].storageGB,
      remaining: TIER_LIMITS[tier].storageGB - (Number(user?.storageUsedGB) || 0),
      percentage:
        ((Number(user?.storageUsedGB) || 0) / TIER_LIMITS[tier].storageGB) * 100,
    },
    resetDate: aiUsage.resetDate,
  };
}
