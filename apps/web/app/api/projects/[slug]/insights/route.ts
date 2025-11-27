import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/projects/[slug]/insights
 * Get AI-generated insights for a project
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = await params;
    const userId = session.user.id;

    // Get project
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        members: { where: { userId } },
        songs: {
          select: {
            id: true,
            status: true,
            lyrics: true,
            audioUrl: true,
            updatedAt: true,
          },
        },
        milestones: {
          select: {
            status: true,
            dueDate: true,
            completedAt: true,
          },
        },
        studioSessions: {
          select: {
            startTime: true,
            endTime: true,
          },
        },
        insights: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.members.length === 0 && project.visibility === 'private') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // If insights exist and are fresh (< 24 hours), return them
    if (
      project.insights &&
      new Date(project.insights.lastAnalyzedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ) {
      return NextResponse.json({ insights: project.insights });
    }

    // Generate new insights
    const insights = await generateProjectInsights(project);

    // Save insights
    if (project.insights) {
      await db.projectInsight.update({
        where: { id: project.insights.id },
        data: {
          ...insights,
          lastAnalyzedAt: new Date(),
        },
      });
    } else {
      await db.projectInsight.create({
        data: {
          projectId: project.id,
          ...insights,
          lastAnalyzedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('GET /api/projects/[slug]/insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

// AI-powered project analysis
async function generateProjectInsights(project: any) {
  const songs = project.songs || [];
  const milestones = project.milestones || [];
  const sessions = project.studioSessions || [];

  // Completion Score (0-100)
  const completedSongs = songs.filter((s: any) => s.status === 'complete').length;
  const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
  const completionScore =
    songs.length + milestones.length > 0
      ? Math.round(
          ((completedSongs + completedMilestones) / (songs.length + milestones.length)) * 100
        )
      : 0;

  // Detect blockers
  const blockers: string[] = [];

  if (songs.filter((s: any) => s.status === 'draft').length > songs.length * 0.5) {
    blockers.push('Over 50% of songs are still in draft status');
  }

  // Helper function to check if a value can be parsed as a valid date
  // Note: This returns boolean, not a type guard, because it validates
  // date-convertible values (string | number | Date), not just Date objects
  const canParseAsDate = (value: unknown): boolean => {
    if (value == null) return false;
    if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
      return false;
    }
    const parsed = new Date(value);
    return !isNaN(parsed.getTime());
  };
  
  const overdueMilestones = milestones.filter((m: any) => {
    if (!canParseAsDate(m.dueDate)) return false;
    const dueDate = new Date(m.dueDate);
    return dueDate < new Date() && m.status !== 'completed';
  });
  if (overdueMilestones.length > 0) {
    blockers.push(`${overdueMilestones.length} milestone(s) are overdue`);
  }

  if (songs.filter((s: any) => !s.lyrics || s.lyrics.length < 50).length > 0) {
    blockers.push('Some songs have incomplete or missing lyrics');
  }

  if (songs.filter((s: any) => !s.audioUrl).length > songs.length * 0.7) {
    blockers.push('Most songs are missing audio recordings');
  }

  // Generate suggestions
  const suggestions: string[] = [];

  if (completionScore < 30) {
    suggestions.push('Focus on completing songs in draft status to build momentum');
  }

  if (songs.length > 0 && sessions.length === 0) {
    suggestions.push('Schedule studio sessions to track recording progress');
  }

  if (milestones.filter((m: any) => m.status === 'in_progress').length > 3) {
    suggestions.push('Too many milestones in progress - consider focusing on fewer goals');
  }

  if (completionScore > 70) {
    suggestions.push('Great progress! Consider planning your release strategy');
  }

  if (
    songs.length >= 10 &&
    !milestones.some((m: any) => m.title.toLowerCase().includes('release'))
  ) {
    suggestions.push('You have enough songs - create a release milestone');
  }

  // Estimate days to completion (simple heuristic)
  const remainingTasks = songs.length - completedSongs + (milestones.length - completedMilestones);
  const avgTasksPerWeek = sessions.length > 0 ? Math.max(1, sessions.length / 4) : 2;
  const estimatedDays = remainingTasks > 0 ? Math.ceil((remainingTasks / avgTasksPerWeek) * 7) : 0;

  // Activity patterns
  const sessionsByDay: Record<string, number> = {};
  sessions.forEach((s: any) => {
    if (!canParseAsDate(s.startTime)) return;
    const day = new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'long' });
    sessionsByDay[day] = (sessionsByDay[day] || 0) + 1;
  });
  const mostActiveDay = Object.entries(sessionsByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // Average session length
  const sessionDurations = sessions
    .filter((s: any) => s.endTime && canParseAsDate(s.startTime) && canParseAsDate(s.endTime))
    .map((s: any) => {
      const start = new Date(s.startTime).getTime();
      const end = new Date(s.endTime).getTime();
      return (end - start) / (1000 * 60 * 60); // hours
    });
  const averageSession =
    sessionDurations.length > 0
      ? sessionDurations.reduce((a: number, b: number) => a + b, 0) / sessionDurations.length
      : null;

  // Velocity trend (simplified)
  const recentActivity = songs.filter((s: any) => {
    if (!canParseAsDate(s.updatedAt)) return false;
    const updatedAt = new Date(s.updatedAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return updatedAt > weekAgo;
  }).length;
  const velocityTrend = recentActivity > songs.length * 0.3 ? 'increasing' : 'stable';

  // Quality metrics
  const audioQuality =
    (songs.filter((s: any) => s.audioUrl).length / Math.max(songs.length, 1)) * 100;
  const lyricsComplete =
    (songs.filter((s: any) => s.lyrics && s.lyrics.length > 100).length /
      Math.max(songs.length, 1)) *
    100;
  const mixReady = songs.length > 0 && songs.every((s: any) => s.status === 'complete');

  return {
    completionScore,
    blockers,
    suggestions,
    estimatedDays: estimatedDays > 0 ? estimatedDays : null,
    mostActiveDay,
    averageSession,
    velocityTrend,
    audioQuality: Math.round(audioQuality),
    lyricsComplete: Math.round(lyricsComplete),
    mixReady,
  };
}






