/**
 * AI SUBSCRIPTION HELPER
 *
 * Helps the AI understand and assist with subscription management:
 * - Know user's current tier and usage
 * - Explain tier benefits
 * - Suggest upgrades when hitting limits
 * - Help with downgrade decisions
 * - Generate upgrade/downgrade recommendations
 */

import { prisma } from '@cronkwaters/db';
import { TIER_LIMITS } from '@/lib/usage-tracking';

// ============================================
// TYPES
// ============================================

export interface SubscriptionContext {
  currentTier: 'free' | 'creator' | 'studio';
  status: string | null;
  usage: {
    aiConversations: { used: number; limit: number; percentage: number };
    storage: { used: number; limit: number; percentage: number };
    projects: { used: number; limit: number; percentage: number };
    videoMinutes: { used: number; limit: number; percentage: number };
  };
  daysUntilReset: number;
  accountAge: number;
  isAtLimit: boolean;
  isNearLimit: boolean; // >75%
  recommendedTier: 'free' | 'creator' | 'studio';
  upgradeReasons: string[];
  downgradeReasons: string[];
}

export interface TierComparison {
  tier: 'free' | 'creator' | 'studio';
  price: string;
  features: string[];
  limits: {
    aiConversations: string;
    storage: string;
    projects: string;
    videoMinutes: string;
  };
  bestFor: string;
}

// ============================================
// TIER INFORMATION
// ============================================

const TIER_INFO: Record<string, TierComparison> = {
  free: {
    tier: 'free',
    price: '$0/month',
    features: [
      'Basic songwriting tools',
      'Up to 3 projects',
      '1 GB storage',
      '10 AI conversations/month',
      'Community support',
    ],
    limits: {
      aiConversations: '10/month',
      storage: '1 GB',
      projects: '3 max',
      videoMinutes: 'None',
    },
    bestFor: 'Trying out the platform, casual hobbyists',
  },
  creator: {
    tier: 'creator',
    price: '$15/month',
    features: [
      'Unlimited projects',
      '10 GB storage',
      '100 AI conversations/month',
      'Setlist management',
      'Tour planning',
      'Collaboration tools',
      'Advanced analytics',
      'Content generation (press releases, social posts)',
      'Email support',
    ],
    limits: {
      aiConversations: '100/month',
      storage: '10 GB',
      projects: 'Unlimited',
      videoMinutes: 'None',
    },
    bestFor: 'Active musicians, songwriters, solo artists',
  },
  studio: {
    tier: 'studio',
    price: '$35/month',
    features: [
      'Everything in Creator',
      '100 GB storage',
      'UNLIMITED AI conversations',
      'Video collaboration (20 hours/month)',
      'Tour budget tools',
      'Royalty split calculator',
      'API access',
      'Custom branding',
      'Priority support',
      'AI memory that never forgets',
    ],
    limits: {
      aiConversations: 'Unlimited',
      storage: '100 GB',
      projects: 'Unlimited',
      videoMinutes: '1200/month',
    },
    bestFor: 'Bands, producers, labels, power users',
  },
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Get full subscription context for a user
 */
export async function getSubscriptionContext(userId: string): Promise<SubscriptionContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isOwner: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      aiRequestsUsed: true,
      assistantConversationsUsed: true,
      storageUsedGB: true,
      videoMinutesUsed: true,
      usagePeriodStart: true,
      createdAt: true,
      memberships: {
        select: {
          org: {
            select: {
              projects: { select: { id: true } },
            },
          },
        },
      },
    },
  });

  if (!user) throw new Error('User not found');

  // OWNER BYPASS: Platform owner has unlimited everything
  if (user.isOwner) {
    const projectCount = user.memberships.reduce((total, m) => total + m.org.projects.length, 0);
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000));

    return {
      currentTier: 'studio',
      status: 'active',
      usage: {
        aiConversations: { used: 0, limit: Infinity, percentage: 0 },
        storage: { used: 0, limit: Infinity, percentage: 0 },
        projects: { used: projectCount, limit: Infinity, percentage: 0 },
        videoMinutes: { used: 0, limit: Infinity, percentage: 0 },
      },
      daysUntilReset: 365,
      accountAge,
      isAtLimit: false,
      isNearLimit: false,
      recommendedTier: 'studio',
      upgradeReasons: [],
      downgradeReasons: [],
    };
  }

  const tier = (user.subscriptionStatus === 'active' ? user.subscriptionTier : 'free') as
    | 'free'
    | 'creator'
    | 'studio';
  const limits = TIER_LIMITS[tier];

  // Count projects
  const projectCount = user.memberships.reduce((total, m) => total + m.org.projects.length, 0);

  // Calculate usage
  const aiUsed = user.assistantConversationsUsed || 0;
  const aiLimit = limits.assistantConversations;
  const aiPercentage = aiLimit > 0 ? (aiUsed / aiLimit) * 100 : 0;

  const storageUsed = Number(user.storageUsedGB) || 0;
  const storageLimit = limits.storageGB;
  const storagePercentage = (storageUsed / storageLimit) * 100;

  const projectLimit = limits.projects;
  const projectPercentage = projectLimit > 0 ? (projectCount / projectLimit) * 100 : 0;

  const videoUsed = user.videoMinutesUsed || 0;
  const videoLimit = limits.videoMinutes;
  const videoPercentage = videoLimit > 0 ? (videoUsed / videoLimit) * 100 : 0;

  // Days until reset
  const periodStart = user.usagePeriodStart || new Date();
  const resetDate = new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  const daysUntilReset = Math.max(
    0,
    Math.ceil((resetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  );

  // Account age
  const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000));

  // Check limits
  const isAtLimit =
    (aiLimit > 0 && aiUsed >= aiLimit) ||
    storageUsed >= storageLimit ||
    (projectLimit > 0 && projectCount >= projectLimit);

  const isNearLimit = aiPercentage >= 75 || storagePercentage >= 75 || projectPercentage >= 75;

  // Generate recommendations
  const { recommendedTier, upgradeReasons, downgradeReasons } = generateRecommendation(tier, {
    aiUsed,
    aiLimit,
    storageUsed,
    storageLimit,
    projectCount,
    projectLimit,
    videoUsed,
    videoLimit,
    accountAge,
  });

  return {
    currentTier: tier,
    status: user.subscriptionStatus,
    usage: {
      aiConversations: {
        used: aiUsed,
        limit: aiLimit === -1 ? Infinity : aiLimit,
        percentage: aiLimit === -1 ? 0 : aiPercentage,
      },
      storage: {
        used: storageUsed,
        limit: storageLimit,
        percentage: storagePercentage,
      },
      projects: {
        used: projectCount,
        limit: projectLimit === -1 ? Infinity : projectLimit,
        percentage: projectLimit === -1 ? 0 : projectPercentage,
      },
      videoMinutes: {
        used: videoUsed,
        limit: videoLimit === -1 ? Infinity : videoLimit,
        percentage: videoLimit === -1 ? 0 : videoPercentage,
      },
    },
    daysUntilReset,
    accountAge,
    isAtLimit,
    isNearLimit,
    recommendedTier,
    upgradeReasons,
    downgradeReasons,
  };
}

/**
 * Generate upgrade/downgrade recommendation
 */
function generateRecommendation(
  currentTier: string,
  usage: {
    aiUsed: number;
    aiLimit: number;
    storageUsed: number;
    storageLimit: number;
    projectCount: number;
    projectLimit: number;
    videoUsed: number;
    videoLimit: number;
    accountAge: number;
  }
): {
  recommendedTier: 'free' | 'creator' | 'studio';
  upgradeReasons: string[];
  downgradeReasons: string[];
} {
  const upgradeReasons: string[] = [];
  const downgradeReasons: string[] = [];

  // Free tier analysis
  if (currentTier === 'free') {
    if (usage.aiUsed >= usage.aiLimit * 0.8) {
      upgradeReasons.push(
        `You've used ${usage.aiUsed}/${usage.aiLimit} AI conversations - upgrade for 100/month!`
      );
    }
    if (usage.projectCount >= 2) {
      upgradeReasons.push(`You're using ${usage.projectCount}/3 projects - upgrade for unlimited!`);
    }
    if (usage.storageUsed >= 0.7) {
      upgradeReasons.push(`Storage at ${Math.round(usage.storageUsed * 100)}% - upgrade for 10GB!`);
    }
    if (usage.accountAge > 14 && usage.aiUsed > 5) {
      upgradeReasons.push(
        `You're actively using the platform - Creator tier would supercharge your workflow!`
      );
    }

    return {
      recommendedTier: upgradeReasons.length >= 2 ? 'creator' : 'free',
      upgradeReasons,
      downgradeReasons: [],
    };
  }

  // Creator tier analysis
  if (currentTier === 'creator') {
    // Check for upgrade needs
    if (usage.aiUsed >= usage.aiLimit * 0.9) {
      upgradeReasons.push(
        `You've used ${usage.aiUsed}/${usage.aiLimit} AI conversations - Studio has unlimited!`
      );
    }
    if (usage.storageUsed >= 8) {
      upgradeReasons.push(`Storage at ${usage.storageUsed.toFixed(1)}GB/10GB - Studio has 100GB!`);
    }
    if (usage.videoUsed > 0 || usage.aiUsed > 80) {
      upgradeReasons.push(`Power user detected! Studio tier would remove all limits.`);
    }

    // Check for potential downgrade
    if (usage.aiUsed < 20 && usage.storageUsed < 0.5 && usage.projectCount <= 3) {
      downgradeReasons.push(`Light usage this month - you might be fine on Free tier`);
    }

    const shouldUpgrade = upgradeReasons.length >= 2;
    const couldDowngrade = downgradeReasons.length > 0 && upgradeReasons.length === 0;

    return {
      recommendedTier: shouldUpgrade ? 'studio' : couldDowngrade ? 'free' : 'creator',
      upgradeReasons,
      downgradeReasons,
    };
  }

  // Studio tier analysis
  if (currentTier === 'studio') {
    // Check if they're underutilizing
    if (usage.aiUsed < 50 && usage.storageUsed < 5 && usage.videoUsed < 60) {
      downgradeReasons.push(
        `You're using less than 50% of Studio features - Creator might be enough`
      );
    }
    if (usage.aiUsed < 30 && usage.projectCount <= 5) {
      downgradeReasons.push(`Light usage pattern - could save $20/month on Creator tier`);
    }

    return {
      recommendedTier: downgradeReasons.length >= 2 ? 'creator' : 'studio',
      upgradeReasons: [],
      downgradeReasons,
    };
  }

  return {
    recommendedTier: currentTier as 'free' | 'creator' | 'studio',
    upgradeReasons: [],
    downgradeReasons: [],
  };
}

/**
 * Get tier comparison for AI to explain
 */
export function getTierComparison(): TierComparison[] {
  return [TIER_INFO.free, TIER_INFO.creator, TIER_INFO.studio];
}

/**
 * Get specific tier details
 */
export function getTierDetails(tier: string): TierComparison | null {
  return TIER_INFO[tier] || null;
}

/**
 * Calculate savings/cost for tier change
 */
export function calculateTierChange(
  currentTier: string,
  newTier: string
): {
  direction: 'upgrade' | 'downgrade' | 'same';
  monthlyDifference: number;
  yearlyDifference: number;
  newFeatures: string[];
  lostFeatures: string[];
} {
  const prices: Record<string, number> = {
    free: 0,
    creator: 15,
    studio: 35,
  };

  const currentPrice = prices[currentTier] || 0;
  const newPrice = prices[newTier] || 0;
  const difference = newPrice - currentPrice;

  const currentFeatures = TIER_INFO[currentTier]?.features || [];
  const newFeaturesList = TIER_INFO[newTier]?.features || [];

  const newFeatures = newFeaturesList.filter((f) => !currentFeatures.includes(f));
  const lostFeatures = currentFeatures.filter((f) => !newFeaturesList.includes(f));

  return {
    direction: difference > 0 ? 'upgrade' : difference < 0 ? 'downgrade' : 'same',
    monthlyDifference: difference,
    yearlyDifference: difference * 12,
    newFeatures,
    lostFeatures,
  };
}

// ============================================
// AI FUNCTION DEFINITIONS
// ============================================

export const SUBSCRIPTION_AI_FUNCTIONS = [
  {
    name: 'getSubscriptionContext',
    description:
      "Get the user's current subscription tier, usage stats, and recommendations for upgrade/downgrade",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'explainTiers',
    description: 'Explain the different subscription tiers and their benefits',
    parameters: {
      type: 'object',
      properties: {
        focusTier: {
          type: 'string',
          enum: ['free', 'creator', 'studio', 'all'],
          description: 'Which tier to focus on explaining (or all)',
        },
      },
    },
  },
  {
    name: 'recommendSubscription',
    description: 'Give a personalized subscription recommendation based on usage patterns',
    parameters: {
      type: 'object',
      properties: {
        consideringTier: {
          type: 'string',
          enum: ['free', 'creator', 'studio'],
          description: 'Tier the user is considering switching to',
        },
      },
    },
  },
];

/**
 * Format subscription context for AI
 */
export function formatSubscriptionForAI(ctx: SubscriptionContext): string {
  const tierEmoji = {
    free: '🆓',
    creator: '⭐',
    studio: '👑',
  };

  let section = `## 💳 SUBSCRIPTION STATUS

### Current Plan: ${tierEmoji[ctx.currentTier]} ${ctx.currentTier.toUpperCase()} ${ctx.status === 'active' ? '(Active)' : ''}

### Usage This Month (resets in ${ctx.daysUntilReset} days)
`;

  // AI Conversations
  const aiLimit =
    ctx.usage.aiConversations.limit === Infinity ? '∞' : ctx.usage.aiConversations.limit;
  const aiBar =
    ctx.usage.aiConversations.limit === Infinity
      ? '████████████████████ Unlimited'
      : getProgressBar(ctx.usage.aiConversations.percentage);
  section += `- **AI Conversations:** ${ctx.usage.aiConversations.used}/${aiLimit} ${aiBar}\n`;

  // Storage
  const storageBar = getProgressBar(ctx.usage.storage.percentage);
  section += `- **Storage:** ${ctx.usage.storage.used.toFixed(1)}GB/${ctx.usage.storage.limit}GB ${storageBar}\n`;

  // Projects
  const projectLimit = ctx.usage.projects.limit === Infinity ? '∞' : ctx.usage.projects.limit;
  section += `- **Projects:** ${ctx.usage.projects.used}/${projectLimit}\n`;

  // Video (if applicable)
  if (ctx.currentTier === 'studio') {
    const videoLimit =
      ctx.usage.videoMinutes.limit === Infinity ? '∞' : ctx.usage.videoMinutes.limit;
    section += `- **Video Minutes:** ${ctx.usage.videoMinutes.used}/${videoLimit}\n`;
  }

  // Warnings
  if (ctx.isAtLimit) {
    section += `\n### ⚠️ LIMIT REACHED
You've hit a limit! Suggest upgrading to continue using all features.\n`;
  } else if (ctx.isNearLimit) {
    section += `\n### ⚡ APPROACHING LIMIT
Usage is above 75%. Might want to mention upgrade options.\n`;
  }

  // Recommendations
  if (ctx.upgradeReasons.length > 0) {
    section += `\n### 📈 UPGRADE REASONS\n`;
    ctx.upgradeReasons.forEach((r) => {
      section += `- ${r}\n`;
    });
    section += `\n**Recommended:** ${tierEmoji[ctx.recommendedTier]} ${ctx.recommendedTier.toUpperCase()}\n`;
  }

  if (ctx.downgradeReasons.length > 0) {
    section += `\n### 💡 POTENTIAL SAVINGS\n`;
    ctx.downgradeReasons.forEach((r) => {
      section += `- ${r}\n`;
    });
  }

  section += `\n### 🔗 ACTIONS
- To upgrade: [Button: Upgrade Plan →] or go to Settings > Subscription
- To manage: [Button: Manage Subscription →]
`;

  return section;
}

function getProgressBar(percentage: number): string {
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  const bar = '█'.repeat(Math.min(filled, 20)) + '░'.repeat(Math.max(empty, 0));
  const warning = percentage >= 90 ? '🔴' : percentage >= 75 ? '🟡' : '🟢';
  return `${warning} ${Math.round(percentage)}%`;
}
