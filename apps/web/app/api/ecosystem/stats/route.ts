import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all stats in parallel
    const [songCount, practiceData, collaborationCount, showCount, revenueData, musicianProfile] =
      await Promise.all([
        // Total songs
        prisma.song.count({
          where: { userId, archived: false },
        }),

        // Practice stats - sum of all practice sessions
        prisma.practiceSession.aggregate({
          where: { userId },
          _sum: { durationMinutes: true },
        }),

        // Collaborations (projects with multiple members)
        prisma.projectMember.count({
          where: { userId },
        }),

        // Shows played (completed shows for user's orgs)
        prisma.show.count({
          where: {
            org: {
              memberships: {
                some: { userId },
              },
            },
            status: 'completed',
          },
        }),

        // Total revenue
        prisma.revenue.aggregate({
          where: { userId },
          _sum: { amount: true },
        }),

        // Musician profile for streaks
        prisma.musicianProfile.findUnique({
          where: { userId },
          select: {
            currentStreak: true,
            longestStreak: true,
            totalPracticeMinutes: true,
          },
        }),
      ]);

    // Calculate practice streak from recent sessions
    const recentSessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 30,
      select: { startTime: true },
    });

    // Simple streak calculation - consecutive days
    let practiceStreak = 0;
    if (recentSessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dates = new Set(
        recentSessions.map((s) => {
          const d = new Date(s.startTime);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        if (dates.has(checkDate.getTime())) {
          practiceStreak++;
        } else if (i > 0) {
          break; // Streak broken
        }
      }
    }

    // Use stored value if higher (user may have practiced today)
    practiceStreak = Math.max(practiceStreak, musicianProfile?.currentStreak || 0);

    return NextResponse.json({
      totalSongs: songCount,
      practiceMinutes:
        practiceData._sum.durationMinutes || musicianProfile?.totalPracticeMinutes || 0,
      practiceStreak,
      longestStreak: musicianProfile?.longestStreak || practiceStreak,
      collaborations: collaborationCount,
      showsPlayed: showCount,
      totalRevenue: Number(revenueData._sum.amount || 0),
    });
  } catch (error) {
    console.error('Error fetching ecosystem stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
