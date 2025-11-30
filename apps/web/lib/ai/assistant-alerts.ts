/**
 * AI ASSISTANT PROACTIVE ALERTS
 *
 * Generates intelligent alerts based on user's data:
 * - Upcoming deadlines
 * - Stale projects/songs
 * - Usage warnings
 * - Missing setlists
 * - Incomplete profiles
 * - Collaboration opportunities
 */

import { prisma } from '@cronkwaters/db';
import { TIER_LIMITS } from '@/lib/usage-tracking';

export interface ProactiveAlert {
  type:
    | 'deadline'
    | 'stale'
    | 'usage'
    | 'missing'
    | 'incomplete'
    | 'opportunity'
    | 'achievement'
    | 'reminder';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionSuggestion: string;
  relatedId?: string;
  relatedType?: 'song' | 'project' | 'tour' | 'show';
}

/**
 * Generate all proactive alerts for a user
 */
export async function generateProactiveAlerts(userId: string): Promise<ProactiveAlert[]> {
  const alerts: ProactiveAlert[] = [];

  // Run all checks in parallel
  await Promise.all([
    checkDeadlines(userId, alerts),
    checkStaleSongs(userId, alerts),
    checkStaleProjects(userId, alerts),
    checkUsageWarnings(userId, alerts),
    checkMissingSetlists(userId, alerts),
    checkIncompleteProfile(userId, alerts),
    checkUpcomingShows(userId, alerts),
    checkAchievements(userId, alerts),
    checkDraftSongs(userId, alerts),
  ]);

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return alerts;
}

/**
 * Check for upcoming deadlines (milestones, release dates)
 */
async function checkDeadlines(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Check project milestones
  const upcomingMilestones = await prisma.milestone.findMany({
    where: {
      project: { members: { some: { userId } } },
      completed: false,
      dueDate: { lte: sevenDaysFromNow, gte: now },
    },
    select: {
      title: true,
      dueDate: true,
      project: { select: { id: true, name: true } },
    },
    take: 5,
  });

  upcomingMilestones.forEach((m) => {
    const daysUntil = Math.ceil((m.dueDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    alerts.push({
      type: 'deadline',
      priority: daysUntil <= 2 ? 'high' : 'medium',
      title: `Milestone Due ${daysUntil === 0 ? 'Today' : `in ${daysUntil} days`}`,
      message: `"${m.title}" for project "${m.project.name}" is due ${daysUntil === 0 ? 'today' : `in ${daysUntil} days`}.`,
      actionSuggestion: `Let's review what's needed to complete this milestone.`,
      relatedId: m.project.id,
      relatedType: 'project',
    });
  });

  // Check project release dates
  const upcomingReleases = await prisma.project.findMany({
    where: {
      members: { some: { userId } },
      targetReleaseDate: { lte: sevenDaysFromNow, gte: now },
      status: { not: 'released' },
    },
    select: { id: true, name: true, targetReleaseDate: true },
    take: 5,
  });

  upcomingReleases.forEach((p) => {
    const daysUntil = Math.ceil(
      (p.targetReleaseDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    );
    alerts.push({
      type: 'deadline',
      priority: 'high',
      title: `Release Date Approaching`,
      message: `"${p.name}" is scheduled to release ${daysUntil === 0 ? 'today' : `in ${daysUntil} days`}!`,
      actionSuggestion: `Let's make sure everything is ready for release.`,
      relatedId: p.id,
      relatedType: 'project',
    });
  });
}

/**
 * Check for songs that haven't been updated in a while
 */
async function checkStaleSongs(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const staleSongs = await prisma.song.findMany({
    where: {
      userId,
      archived: false,
      status: { in: ['draft', 'in_progress'] },
      updatedAt: { lt: thirtyDaysAgo },
    },
    select: { id: true, title: true, updatedAt: true, status: true },
    orderBy: { updatedAt: 'asc' },
    take: 3,
  });

  if (staleSongs.length > 0) {
    const songTitles = staleSongs.map((s) => `"${s.title}"`).join(', ');
    const daysStale = Math.floor(
      (Date.now() - staleSongs[0].updatedAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    alerts.push({
      type: 'stale',
      priority: 'medium',
      title: `${staleSongs.length} Song${staleSongs.length > 1 ? 's' : ''} Need Attention`,
      message: `${songTitles} ${staleSongs.length > 1 ? "haven't" : "hasn't"} been updated in ${daysStale}+ days.`,
      actionSuggestion: `Want to pick one up and finish it? I can help with lyrics or arrangement ideas.`,
      relatedId: staleSongs[0].id,
      relatedType: 'song',
    });
  }
}

/**
 * Check for projects that need attention
 */
async function checkStaleProjects(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const staleProjects = await prisma.project.findMany({
    where: {
      members: { some: { userId } },
      status: { in: ['planning', 'in_progress'] },
      updatedAt: { lt: fourteenDaysAgo },
    },
    select: { id: true, name: true, updatedAt: true },
    take: 2,
  });

  staleProjects.forEach((p) => {
    const daysStale = Math.floor((Date.now() - p.updatedAt.getTime()) / (24 * 60 * 60 * 1000));
    alerts.push({
      type: 'stale',
      priority: 'low',
      title: `Project Needs Love`,
      message: `"${p.name}" hasn't had any activity in ${daysStale} days.`,
      actionSuggestion: `Should we review what's next for this project?`,
      relatedId: p.id,
      relatedType: 'project',
    });
  });
}

/**
 * Check usage limits and warn if getting close
 */
async function checkUsageWarnings(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      aiRequestsUsed: true,
      assistantConversationsUsed: true,
      storageUsedGB: true,
      videoMinutesUsed: true,
    },
  });

  if (!user) return;

  const tier = (
    user.subscriptionStatus === 'active' ? user.subscriptionTier : 'free'
  ) as keyof typeof TIER_LIMITS;
  const limits = TIER_LIMITS[tier];

  // Check AI conversations (if not unlimited)
  if (limits.assistantConversations > 0) {
    const used = user.assistantConversationsUsed || 0;
    const percentUsed = (used / limits.assistantConversations) * 100;

    if (percentUsed >= 90) {
      alerts.push({
        type: 'usage',
        priority: 'high',
        title: `AI Conversations Almost Depleted`,
        message: `You've used ${used} of ${limits.assistantConversations} AI conversations this month (${Math.round(percentUsed)}%).`,
        actionSuggestion:
          tier === 'free'
            ? 'Upgrade to Creator for 100 conversations!'
            : 'Upgrade to Studio for unlimited!',
      });
    } else if (percentUsed >= 75) {
      alerts.push({
        type: 'usage',
        priority: 'medium',
        title: `AI Conversations at 75%`,
        message: `You've used ${used} of ${limits.assistantConversations} AI conversations.`,
        actionSuggestion: `Still plenty left, but heads up!`,
      });
    }
  }

  // Check storage
  const storageUsed = Number(user.storageUsedGB) || 0;
  const storagePercent = (storageUsed / limits.storageGB) * 100;

  if (storagePercent >= 90) {
    alerts.push({
      type: 'usage',
      priority: 'high',
      title: `Storage Almost Full`,
      message: `You're using ${storageUsed.toFixed(1)}GB of ${limits.storageGB}GB storage (${Math.round(storagePercent)}%).`,
      actionSuggestion: `Consider archiving old files or upgrading for more space.`,
    });
  } else if (storagePercent >= 75) {
    alerts.push({
      type: 'usage',
      priority: 'low',
      title: `Storage at 75%`,
      message: `${storageUsed.toFixed(1)}GB of ${limits.storageGB}GB used.`,
      actionSuggestion: `Might want to clean up unused files soon.`,
    });
  }
}

/**
 * Check for shows missing setlists
 */
async function checkMissingSetlists(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const now = new Date();
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const showsWithoutSetlists = await prisma.show.findMany({
    where: {
      org: { members: { some: { userId } } },
      date: { gte: now, lte: fourteenDaysFromNow },
      setlist: null,
      status: { not: 'cancelled' },
    },
    select: {
      id: true,
      name: true,
      date: true,
      venue: { select: { name: true, city: true } },
    },
    orderBy: { date: 'asc' },
    take: 3,
  });

  if (showsWithoutSetlists.length > 0) {
    const daysUntilFirst = Math.ceil(
      (showsWithoutSetlists[0].date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
    );

    alerts.push({
      type: 'missing',
      priority: daysUntilFirst <= 3 ? 'high' : 'medium',
      title: `${showsWithoutSetlists.length} Show${showsWithoutSetlists.length > 1 ? 's' : ''} Need Setlists`,
      message: `${showsWithoutSetlists.map((s) => `"${s.name}" (${new Date(s.date).toLocaleDateString()})`).join(', ')} - no setlist yet!`,
      actionSuggestion: `Want me to build optimized setlists based on your songs?`,
      relatedId: showsWithoutSetlists[0].id,
      relatedType: 'show',
    });
  }
}

/**
 * Check for incomplete profile
 */
async function checkIncompleteProfile(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileCompleted: true,
      name: true,
      bio: true,
      image: true,
    },
  });

  if (!user?.profileCompleted) {
    const missing: string[] = [];
    if (!user?.bio) missing.push('bio');
    if (!user?.image) missing.push('profile photo');

    if (missing.length > 0) {
      alerts.push({
        type: 'incomplete',
        priority: 'low',
        title: `Complete Your Profile`,
        message: `Your profile is missing: ${missing.join(', ')}.`,
        actionSuggestion: `A complete profile helps collaborators find and trust you!`,
      });
    }
  }
}

/**
 * Check for upcoming shows (excitement/preparation)
 */
async function checkUpcomingShows(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingShows = await prisma.show.findMany({
    where: {
      org: { members: { some: { userId } } },
      date: { gte: now, lte: threeDaysFromNow },
      status: { not: 'cancelled' },
    },
    select: {
      id: true,
      name: true,
      date: true,
      venue: { select: { name: true, city: true } },
      setlist: { select: { id: true } },
    },
    orderBy: { date: 'asc' },
    take: 2,
  });

  upcomingShows.forEach((show) => {
    const daysUntil = Math.ceil((show.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    if (show.setlist) {
      alerts.push({
        type: 'reminder',
        priority: daysUntil === 0 ? 'high' : 'medium',
        title: `Show ${daysUntil === 0 ? 'TODAY' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}!`,
        message: `"${show.name}" at ${show.venue?.name || 'TBD'}${show.venue?.city ? `, ${show.venue.city}` : ''}.`,
        actionSuggestion: `Setlist is ready! Need anything else for the show?`,
        relatedId: show.id,
        relatedType: 'show',
      });
    }
  });
}

/**
 * Check for achievements to celebrate
 */
async function checkAchievements(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  // Count user's songs
  const songCount = await prisma.song.count({
    where: { userId, archived: false },
  });

  // Celebrate milestones
  const milestones = [10, 25, 50, 100, 250, 500];
  const recentMilestone = milestones.find((m) => songCount >= m && songCount < m + 3);

  if (recentMilestone) {
    alerts.push({
      type: 'achievement',
      priority: 'low',
      title: `🎉 ${recentMilestone} Songs!`,
      message: `You've written ${songCount} songs! That's amazing dedication.`,
      actionSuggestion: `Keep the momentum going!`,
    });
  }
}

/**
 * Check for songs stuck in draft
 */
async function checkDraftSongs(userId: string, alerts: ProactiveAlert[]): Promise<void> {
  const draftCount = await prisma.song.count({
    where: {
      userId,
      archived: false,
      status: 'draft',
    },
  });

  if (draftCount >= 5) {
    alerts.push({
      type: 'opportunity',
      priority: 'low',
      title: `${draftCount} Songs in Draft`,
      message: `You have ${draftCount} songs waiting to be finished.`,
      actionSuggestion: `Want to pick one and work on it together? I can help with lyrics, chords, or structure.`,
    });
  }
}

/**
 * Format alerts for AI prompt
 */
export function formatAlertsForAI(alerts: ProactiveAlert[]): string {
  if (alerts.length === 0) {
    return `## ⚡ PROACTIVE ALERTS\nNo urgent alerts - everything looks good!`;
  }

  let section = `## ⚡ PROACTIVE ALERTS (${alerts.length})\n\n`;
  section += `**IMPORTANT: Mention these naturally in conversation when relevant!**\n\n`;

  alerts.forEach((alert, i) => {
    const icon =
      alert.type === 'deadline'
        ? '⏰'
        : alert.type === 'usage'
          ? '📊'
          : alert.type === 'stale'
            ? '💤'
            : alert.type === 'missing'
              ? '❓'
              : alert.type === 'achievement'
                ? '🎉'
                : alert.type === 'reminder'
                  ? '📅'
                  : '💡';

    section += `${i + 1}. ${icon} **${alert.title}** [${alert.priority.toUpperCase()}]\n`;
    section += `   ${alert.message}\n`;
    section += `   → Suggest: "${alert.actionSuggestion}"\n\n`;
  });

  return section;
}
