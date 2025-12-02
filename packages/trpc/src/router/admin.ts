import { prisma } from '@cronkwaters/db';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../server/trpc';

// Admin middleware - checks if user is owner
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.viewerId },
    select: { isOwner: true },
  });

  if (!user?.isOwner) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return next({ ctx });
});

export const adminRouter = router({
  // ═══════════════════════════════════════════════════════════════════════════
  // OVERVIEW STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  getOverviewStats: adminProcedure.query(async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // User counts
    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeSubscriptions,
      proUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { subscriptionStatus: 'active' } }),
      prisma.user.count({ where: { subscriptionTier: { not: 'free' } } }),
    ]);

    // Subscription breakdown
    const [freeUsers, creatorUsers, studioUsers] = await Promise.all([
      prisma.user.count({ where: { subscriptionTier: 'free' } }),
      prisma.user.count({ where: { subscriptionTier: 'creator' } }),
      prisma.user.count({ where: { subscriptionTier: 'studio' } }),
    ]);

    // Content counts
    const [
      totalSongs,
      totalProjects,
      totalPosts,
      totalLiveStreams,
      activeLiveStreams,
      totalMeetings,
    ] = await Promise.all([
      prisma.song.count(),
      prisma.explorationProject.count(),
      prisma.post.count(),
      prisma.liveStream.count(),
      prisma.liveStream.count({ where: { status: 'live' } }),
      prisma.meeting.count(),
    ]);

    // Usage statistics
    const usageStats = await prisma.user.aggregate({
      _sum: {
        aiRequestsUsed: true,
        videoMinutesUsed: true,
        imageCreditsUsed: true,
        assistantConversationsUsed: true,
      },
      _avg: {
        storageUsedGB: true,
      },
    });

    // MythaCoin statistics
    const mythaCoinStats = await prisma.mythacoinTransaction.aggregate({
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // DAS Campaigns
    const [totalCampaigns, activeCampaigns] = await Promise.all([
      prisma.dASCampaign.count(),
      prisma.dASCampaign.count({ where: { status: 'active' } }),
    ]);

    return {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        activeSubscriptions,
        proUsers,
        breakdown: {
          free: freeUsers,
          creator: creatorUsers,
          studio: studioUsers,
        },
      },
      content: {
        songs: totalSongs,
        projects: totalProjects,
        posts: totalPosts,
        liveStreams: {
          total: totalLiveStreams,
          active: activeLiveStreams,
        },
        meetings: totalMeetings,
      },
      usage: {
        totalAiRequests: usageStats._sum.aiRequestsUsed || 0,
        totalVideoMinutes: usageStats._sum.videoMinutesUsed || 0,
        totalImageCredits: usageStats._sum.imageCreditsUsed || 0,
        totalAssistantConversations: usageStats._sum.assistantConversationsUsed || 0,
        avgStorageGB: Number(usageStats._avg.storageUsedGB || 0),
      },
      mythaCoin: {
        totalTransactions: mythaCoinStats._count,
        totalVolume: mythaCoinStats._sum.amount || 0,
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
      },
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        tier: z.enum(['all', 'free', 'creator', 'studio']).default('all'),
        sortBy: z.enum(['createdAt', 'name', 'email', 'subscriptionTier']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, search, tier, sortBy, sortOrder } = input;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (tier !== 'all') {
        where.subscriptionTier = tier;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            createdAt: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            isOwner: true,
            mlcMember: true,
            profileCompleted: true,
            aiRequestsUsed: true,
            videoMinutesUsed: true,
            storageUsedGB: true,
            imageCreditsUsed: true,
            _count: {
              select: {
                songs: true,
                posts: true,
                collaborations: true,
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  getUserDetails: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          songs: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          posts: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          accounts: true,
          sessions: {
            take: 5,
            orderBy: { expires: 'desc' },
          },
          mythacoinTransactions: {
            take: 20,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      return user;
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        data: z.object({
          isOwner: z.boolean().optional(),
          subscriptionTier: z.string().optional(),
          subscriptionStatus: z.string().optional(),
          aiRequestsBonus: z.number().optional(),
          videoMinutesBonus: z.number().optional(),
          storageBonusGB: z.number().optional(),
          imageCreditsBonus: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.user.update({
        where: { id: input.userId },
        data: input.data,
      });
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════

  getUserGrowthAnalytics: adminProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const users = await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true, subscriptionTier: true },
        orderBy: { createdAt: 'asc' },
      });

      // Group by day
      const dailySignups: Record<
        string,
        { date: string; total: number; free: number; creator: number; studio: number }
      > = {};

      users.forEach((user) => {
        const dateKey = user.createdAt.toISOString().split('T')[0];
        if (!dailySignups[dateKey]) {
          dailySignups[dateKey] = { date: dateKey, total: 0, free: 0, creator: 0, studio: 0 };
        }
        dailySignups[dateKey].total++;
        dailySignups[dateKey][user.subscriptionTier as 'free' | 'creator' | 'studio']++;
      });

      return Object.values(dailySignups);
    }),

  getRevenueAnalytics: adminProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      // Get subscription tier pricing (placeholder - would come from Stripe in production)
      const tierPricing = {
        free: 0,
        creator: 19.99,
        studio: 49.99,
      };

      const subscriptions = await prisma.user.groupBy({
        by: ['subscriptionTier'],
        _count: true,
        where: { subscriptionStatus: 'active' },
      });

      const mrr = subscriptions.reduce((acc, sub) => {
        return (
          acc + sub._count * (tierPricing[sub.subscriptionTier as keyof typeof tierPricing] || 0)
        );
      }, 0);

      // Get new subscriptions for the period
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const newSubscriptions = await prisma.user.count({
        where: {
          subscriptionStartedAt: { gte: startDate },
          subscriptionTier: { not: 'free' },
        },
      });

      const canceledSubscriptions = await prisma.user.count({
        where: {
          subscriptionCanceledAt: { gte: startDate },
        },
      });

      return {
        mrr,
        arr: mrr * 12,
        newSubscriptions,
        canceledSubscriptions,
        churnRate: newSubscriptions > 0 ? (canceledSubscriptions / newSubscriptions) * 100 : 0,
        subscriptionBreakdown: subscriptions,
      };
    }),

  getContentAnalytics: adminProcedure.query(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [songsCreated, projectsCreated, postsCreated, streamsCreated, meetingsCreated] =
      await Promise.all([
        prisma.song.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.explorationProject.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.post.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.liveStream.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.meeting.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      ]);

    // Top content creators
    const topCreators = await prisma.user.findMany({
      take: 10,
      orderBy: {
        songs: { _count: 'desc' },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: { songs: true, posts: true },
        },
      },
    });

    return {
      last30Days: {
        songs: songsCreated,
        projects: projectsCreated,
        posts: postsCreated,
        streams: streamsCreated,
        meetings: meetingsCreated,
      },
      topCreators,
    };
  }),

  getUsageAnalytics: adminProcedure.query(async () => {
    const usageByTier = await prisma.user.groupBy({
      by: ['subscriptionTier'],
      _sum: {
        aiRequestsUsed: true,
        videoMinutesUsed: true,
        imageCreditsUsed: true,
        assistantConversationsUsed: true,
      },
      _avg: {
        storageUsedGB: true,
      },
    });

    // Top AI users
    const topAiUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { aiRequestsUsed: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        aiRequestsUsed: true,
        aiRequestsBonus: true,
        subscriptionTier: true,
      },
    });

    // Top storage users
    const topStorageUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { storageUsedGB: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        storageUsedGB: true,
        storageBonusGB: true,
        subscriptionTier: true,
      },
    });

    return {
      usageByTier,
      topAiUsers,
      topStorageUsers,
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVITY LOGS
  // ═══════════════════════════════════════════════════════════════════════════

  getRecentActivity: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        type: z.enum(['all', 'users', 'content', 'billing', 'system']).default('all'),
      })
    )
    .query(async ({ input }) => {
      const { limit, type } = input;

      // Build activity feed from various sources
      const activities: any[] = [];

      // Recent user signups
      if (type === 'all' || type === 'users') {
        const recentUsers = await prisma.user.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });
        activities.push(
          ...recentUsers.map((u) => ({
            type: 'user_signup',
            description: `New user registered: ${u.email}`,
            timestamp: u.createdAt,
            userId: u.id,
            metadata: { name: u.name },
          }))
        );
      }

      // Recent content
      if (type === 'all' || type === 'content') {
        const recentSongs = await prisma.song.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            createdAt: true,
            creator: { select: { email: true, name: true } },
          },
        });
        activities.push(
          ...recentSongs.map((s) => ({
            type: 'song_created',
            description: `New song created: "${s.title}" by ${s.creator.email}`,
            timestamp: s.createdAt,
            metadata: { title: s.title, creator: s.creator.name },
          }))
        );

        const recentPosts = await prisma.post.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: { select: { email: true, name: true } },
          },
        });
        activities.push(
          ...recentPosts.map((p) => ({
            type: 'post_created',
            description: `New post by ${p.author.email}`,
            timestamp: p.createdAt,
            metadata: { content: p.content?.substring(0, 100), author: p.author.name },
          }))
        );
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return activities.slice(0, limit);
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // REPORTS & EXPORT
  // ═══════════════════════════════════════════════════════════════════════════

  generateReport: adminProcedure
    .input(
      z.object({
        type: z.enum(['users', 'revenue', 'content', 'usage', 'full']),
        format: z.enum(['json', 'csv']),
        dateRange: z
          .object({
            start: z.string(),
            end: z.string(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { type, format, dateRange } = input;

      let data: any = {};

      const startDate = dateRange ? new Date(dateRange.start) : new Date(0);
      const endDate = dateRange ? new Date(dateRange.end) : new Date();

      switch (type) {
        case 'users':
          data = await prisma.user.findMany({
            where: {
              createdAt: { gte: startDate, lte: endDate },
            },
            select: {
              id: true,
              email: true,
              name: true,
              createdAt: true,
              subscriptionTier: true,
              subscriptionStatus: true,
              aiRequestsUsed: true,
              videoMinutesUsed: true,
              storageUsedGB: true,
            },
          });
          break;

        case 'content':
          data = {
            songs: await prisma.song.findMany({
              where: { createdAt: { gte: startDate, lte: endDate } },
              include: { creator: { select: { email: true } } },
            }),
            projects: await prisma.explorationProject.findMany({
              where: { createdAt: { gte: startDate, lte: endDate } },
            }),
          };
          break;

        case 'usage':
          data = await prisma.user.findMany({
            select: {
              email: true,
              subscriptionTier: true,
              aiRequestsUsed: true,
              aiRequestsBonus: true,
              videoMinutesUsed: true,
              videoMinutesBonus: true,
              storageUsedGB: true,
              storageBonusGB: true,
              imageCreditsUsed: true,
              imageCreditsBonus: true,
            },
          });
          break;

        case 'full':
          data = {
            users: await prisma.user.count(),
            songs: await prisma.song.count(),
            projects: await prisma.explorationProject.count(),
            posts: await prisma.post.count(),
            streams: await prisma.liveStream.count(),
            meetings: await prisma.meeting.count(),
            campaigns: await prisma.dASCampaign.count(),
            mythacoinTransactions: await prisma.mythacoinTransaction.count(),
          };
          break;
      }

      // In production, this would upload to S3/storage and return a download URL
      // For now, return the data directly
      return {
        data,
        format,
        generatedAt: new Date().toISOString(),
        type,
      };
    }),

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE HEALTH
  // ═══════════════════════════════════════════════════════════════════════════

  getDatabaseStats: adminProcedure.query(async () => {
    const tables = await Promise.all([
      prisma.user.count().then((count) => ({ table: 'users', count })),
      prisma.song.count().then((count) => ({ table: 'songs', count })),
      prisma.post.count().then((count) => ({ table: 'posts', count })),
      prisma.explorationProject.count().then((count) => ({ table: 'exploration_projects', count })),
      prisma.liveStream.count().then((count) => ({ table: 'live_streams', count })),
      prisma.meeting.count().then((count) => ({ table: 'meetings', count })),
      prisma.dASCampaign.count().then((count) => ({ table: 'das_campaigns', count })),
      prisma.mythacoinTransaction
        .count()
        .then((count) => ({ table: 'mythacoin_transactions', count })),
      prisma.collaboration.count().then((count) => ({ table: 'collaborations', count })),
      prisma.event.count().then((count) => ({ table: 'events', count })),
    ]);

    return {
      tables,
      totalRecords: tables.reduce((acc, t) => acc + t.count, 0),
    };
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM HEALTH
  // ═══════════════════════════════════════════════════════════════════════════

  getSystemHealth: adminProcedure.query(async () => {
    // Check database connectivity
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    return {
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    };
  }),
});
