import { prisma } from '@cronkwaters/db';
import fs from 'fs';
import path from 'path';

// Cache the platform knowledge to avoid reading from disk on every request
let cachedPlatformKnowledge: string | null = null;

/**
 * Load platform knowledge with multiple fallback paths
 * Handles different working directories in dev vs production
 */
function loadPlatformKnowledge(): string {
  if (cachedPlatformKnowledge) {
    return cachedPlatformKnowledge;
  }

  // Try multiple possible paths (handles monorepo structure)
  const possiblePaths = [
    path.join(process.cwd(), 'lib/ai/platform-knowledge.md'), // Production (apps/web is cwd)
    path.join(process.cwd(), 'apps/web/lib/ai/platform-knowledge.md'), // Dev (workspace root is cwd)
    path.resolve(__dirname, 'platform-knowledge.md'), // Relative to this file
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        cachedPlatformKnowledge = fs.readFileSync(p, 'utf-8');
        console.log(`[AI Assistant] Loaded platform knowledge from: ${p}`);
        return cachedPlatformKnowledge;
      }
    } catch {
      // Try next path
    }
  }

  console.error('[AI Assistant] Could not load platform knowledge from any path:', possiblePaths);
  return 'Platform knowledge unavailable. The assistant can still help with general questions.';
}

/**
 * Build comprehensive context for AI Assistant
 * Includes user data, platform knowledge, and current state
 */
export async function buildAssistantContext(userId: string, currentPage?: string) {
  // Get user data with relevant relations
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      aiRequestsUsed: true,
      videoMinutesUsed: true,
      assistantConversationsUsed: true,
      storageUsedGB: true,
      usagePeriodStart: true,
      subscriptionRenewsAt: true,
      createdAt: true,

      // Projects & collaborations
      memberships: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          role: true,
          org: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
            },
          },
        },
      },

      projectMemberships: {
        take: 5,
        orderBy: { joinedAt: 'desc' },
        select: {
          role: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              songs: {
                take: 3,
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
            },
          },
        },
      },

      // Recent uploads
      uploadedAssets: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          assetType: true,
          bytes: true,
          createdAt: true,
        },
      },

      // Sessions
      studioSessions: {
        take: 3,
        orderBy: { startTime: 'desc' },
        where: {
          startTime: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Load platform knowledge (cached)
  const platformKnowledge = loadPlatformKnowledge();

  // Calculate usage quotas based on tier
  const quotas = getQuotasForTier(user.subscriptionTier);

  // Calculate days until reset
  const daysUntilReset = user.usagePeriodStart
    ? Math.ceil(
        (new Date(user.usagePeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000).getTime() -
          Date.now()) /
          (24 * 60 * 60 * 1000)
      )
    : 30;

  // Build contextual state
  const userContext = {
    user: {
      name: user.name || 'there',
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)),
    },
    usage: {
      aiRequests: {
        used: user.aiRequestsUsed,
        limit: quotas.aiRequests,
        remaining: Math.max(0, quotas.aiRequests - user.aiRequestsUsed),
        percentage: Math.round((user.aiRequestsUsed / quotas.aiRequests) * 100),
      },
      video: {
        used: user.videoMinutesUsed,
        limit: quotas.videoMinutes,
        remaining: Math.max(0, quotas.videoMinutes - user.videoMinutesUsed),
        percentage:
          quotas.videoMinutes > 0
            ? Math.round((user.videoMinutesUsed / quotas.videoMinutes) * 100)
            : 0,
      },
      assistant: {
        used: user.assistantConversationsUsed,
        limit: quotas.assistantConversations,
        remaining: Math.max(0, quotas.assistantConversations - user.assistantConversationsUsed),
      },
      storage: {
        used: Number(user.storageUsedGB),
        limit: quotas.storage,
        remaining: Math.max(0, quotas.storage - Number(user.storageUsedGB)),
        percentage: Math.round((Number(user.storageUsedGB) / quotas.storage) * 100),
      },
      resetsIn: daysUntilReset,
    },
    activity: {
      organizations: user.memberships.length,
      projects: user.projectMemberships.length,
      recentUploads: user.uploadedAssets.length,
      upcomingSessions: user.studioSessions.length,
    },
    recentProjects: user.projectMemberships.map((pm) => ({
      name: pm.project.name,
      role: pm.role,
      status: pm.project.status,
      songs: pm.project.songs.length,
    })),
  };

  // Determine current page context
  let pageContext = 'unknown';
  if (currentPage) {
    if (currentPage.includes('/songwriting')) pageContext = 'songwriting';
    else if (currentPage.includes('/library')) pageContext = 'library';
    else if (currentPage.includes('/studio')) pageContext = 'studio';
    else if (currentPage.includes('/projects')) pageContext = 'projects';
    else if (currentPage.includes('/tours')) pageContext = 'tours';
    else if (currentPage.includes('/explorer')) pageContext = 'explorer';
    else if (currentPage.includes('/settings')) pageContext = 'settings';
    else if (currentPage.includes('/dashboard')) pageContext = 'dashboard';
  }

  return {
    platformKnowledge, // Full knowledge base
    userContext, // Structured user data
    currentPage: pageContext,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get usage quotas for a subscription tier
 */
function getQuotasForTier(tier: string) {
  switch (tier) {
    case 'studio':
      return {
        projects: -1, // unlimited
        storage: 100,
        aiRequests: 500,
        videoMinutes: 1200,
        assistantConversations: 100, // Standard with add-on
      };
    case 'creator':
      return {
        projects: 10,
        storage: 10,
        aiRequests: 100,
        videoMinutes: 0,
        assistantConversations: 30, // Lite tier
      };
    case 'free':
    default:
      return {
        projects: 1,
        storage: 1,
        aiRequests: 0,
        videoMinutes: 0,
        assistantConversations: 0,
      };
  }
}

/**
 * Get relevant platform documentation sections based on intent
 */
export function getRelevantDocs(platformKnowledge: string, intent: string): string {
  // For now, return full knowledge
  // In production, could use embeddings to find most relevant sections
  return platformKnowledge;
}

/**
 * Format context for AI prompt
 */
export function formatContextForAI(context: any): string {
  const { userContext, currentPage, platformKnowledge } = context;

  return `You are the CronkWaters AI Assistant, a helpful expert guide for the CronkWaters music collaboration platform.

## Current User Context
- Name: ${userContext.user.name}
- Subscription: ${userContext.user.tier} tier (${userContext.user.status})
- Current Page: ${currentPage}
- Account Age: ${userContext.user.accountAge} days

### Usage Stats (resets in ${userContext.usage.resetsIn} days)
- AI Requests: ${userContext.usage.aiRequests.used}/${userContext.usage.aiRequests.limit} (${userContext.usage.aiRequests.remaining} remaining)
- Storage: ${userContext.usage.storage.used}GB/${userContext.usage.storage.limit}GB (${userContext.usage.storage.percentage}%)
${
  userContext.user.tier === 'studio'
    ? `- Video Minutes: ${userContext.usage.video.used}/${userContext.usage.video.limit} (${userContext.usage.video.remaining} remaining)`
    : ''
}

### User Activity
- Organizations: ${userContext.activity.organizations}
- Projects: ${userContext.activity.projects}
- Recent Uploads: ${userContext.activity.recentUploads}
- Upcoming Sessions: ${userContext.activity.upcomingSessions}

${
  userContext.recentProjects.length > 0
    ? `### Recent Projects
${userContext.recentProjects.map((p: any) => `- ${p.name} (${p.role}) - ${p.songs} songs`).join('\n')}`
    : ''
}

## Your Role
- Answer questions about CronkWaters features and navigation
- Provide step-by-step guidance
- Help troubleshoot issues
- Offer best practices and tips
- Be proactive with suggestions based on user context

## Guidelines
- Be friendly, helpful, and concise
- Use the user's name when appropriate
- Reference their current usage stats when relevant
- Suggest upgrades tactfully when limits are reached
- Provide specific steps, not vague advice
- Include button prompts when actions are available (e.g., [Button: Go to Settings →])
- Admit limitations - escalate to human support when needed

## Platform Knowledge
${platformKnowledge}

---

Now assist the user with their question, considering their context and current page.`;
}
