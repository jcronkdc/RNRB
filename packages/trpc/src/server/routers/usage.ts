import { z } from 'zod';

import {
  getUsageSummary,
  getUserUsage,
  TIER_LIMITS,
} from '../../../../../apps/web/lib/usage-tracking';
import { getUserSubscription, getFeatureLimits } from '../../../../../apps/web/lib/subscription';
import { router, protectedProcedure } from '../trpc';

export const usageRouter = router({
  /**
   * Get comprehensive usage summary for the current user
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const [usageSummary, subscription] = await Promise.all([
      getUsageSummary(ctx.session.user.id),
      getUserSubscription(ctx.session.user.id),
    ]);

    return {
      ...usageSummary,
      subscription: {
        tier: subscription.tier,
        isActive: subscription.isActive,
        status: subscription.status,
      },
    };
  }),

  /**
   * Get current credits balance
   */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const aiUsage = await getUserUsage(ctx.session.user.id, 'aiRequests');

    return {
      used: aiUsage.used,
      limit: aiUsage.limit,
      remaining: aiUsage.remaining,
      resetDate: aiUsage.resetDate,
      tier: aiUsage.tier,
      unlimited: aiUsage.limit === -1,
    };
  }),

  /**
   * Get detailed feature limits
   */
  getLimits: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('Unauthorized');
    }

    return getFeatureLimits(ctx.session.user.id);
  }),

  /**
   * Get usage history for a specific type
   */
  getUsageHistory: protectedProcedure
    .input(
      z.object({
        type: z.enum(['aiRequests', 'videoMinutes', 'imageCredits', 'assistantConversations']),
        days: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) {
        throw new Error('Unauthorized');
      }

      // TODO: Implement usage history tracking in database
      // For now, return current usage
      const usage = await getUserUsage(ctx.session.user.id, input.type);

      return {
        type: input.type,
        current: usage.used,
        limit: usage.limit,
        history: [], // Will be populated when we add usage history table
      };
    }),

  /**
   * Get tier comparison data for upgrade prompts
   */
  getTierComparison: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const subscription = await getUserSubscription(ctx.session.user.id);

    return {
      currentTier: subscription.tier,
      tiers: {
        free: {
          name: 'Free',
          price: 0,
          aiRequests: TIER_LIMITS.free.aiRequests,
          videoMinutes: TIER_LIMITS.free.videoMinutes,
          imageCredits: TIER_LIMITS.free.imageCredits,
          projects: TIER_LIMITS.free.projects,
          storageGB: TIER_LIMITS.free.storageGB,
          collaborators: TIER_LIMITS.free.collaborators,
        },
        creator: {
          name: 'Creator',
          price: 14.99,
          aiRequests: TIER_LIMITS.creator.aiRequests,
          videoMinutes: TIER_LIMITS.creator.videoMinutes,
          imageCredits: TIER_LIMITS.creator.imageCredits,
          projects: TIER_LIMITS.creator.projects,
          storageGB: TIER_LIMITS.creator.storageGB,
          collaborators: TIER_LIMITS.creator.collaborators,
        },
        studio: {
          name: 'Studio',
          price: 29.99,
          aiRequests: TIER_LIMITS.studio.aiRequests,
          videoMinutes: TIER_LIMITS.studio.videoMinutes,
          imageCredits: TIER_LIMITS.studio.imageCredits,
          projects: TIER_LIMITS.studio.projects,
          storageGB: TIER_LIMITS.studio.storageGB,
          collaborators: TIER_LIMITS.studio.collaborators,
        },
      },
    };
  }),
});
