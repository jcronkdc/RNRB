import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { generateOptimalSetlist, type OptimizerOptions } from '@/lib/ai/setlist-optimizer';
import { getCurrentUser } from '@/lib/session';
import { requireFeatureAccess, SubscriptionError } from '@/lib/subscription';

/**
 * POST /api/setlists/generate
 * Generate a world-class AI-optimized setlist from available songs
 * REQUIRES: Creator or Studio subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription access - FEATURE GATE
    try {
      await requireFeatureAccess(user.id, 'setlistManagement');
    } catch (error) {
      if (error instanceof SubscriptionError) {
        return NextResponse.json(
          {
            error: 'Subscription required',
            message: error.message,
            feature: error.feature,
            requiredTier: error.requiredTier,
            upgradeUrl: '/settings/billing?upgrade=creator',
          },
          { status: 403 }
        );
      }
      throw error;
    }

    const body = await request.json();
    const {
      projectId,
      targetDuration = 90,
      energyProfile = 'balanced',
      requiredSongs = [],
      excludedSongs = [],
      openingSong,
      closingSong,
      avoidKeyJumps = true,
      prioritizePopular = false,
      genreBalance = 'mixed',
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Verify user has access to project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: user.id },
        },
        songs: {
          orderBy: { title: 'asc' },
        },
      },
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 });
    }

    if (project.songs.length === 0) {
      return NextResponse.json(
        { error: 'No songs in project to generate setlist from' },
        { status: 400 }
      );
    }

    // Build optimizer options
    const options: OptimizerOptions = {
      targetDuration,
      energyProfile,
      requiredSongs,
      excludedSongs,
      openingSong,
      closingSong,
      avoidKeyJumps,
      prioritizePopular,
      genreBalance,
      allowedDeviation: 5,
    };

    // Generate optimized setlist using world-class algorithm
    const result = generateOptimalSetlist(project.songs, options);

    return NextResponse.json({
      songs: result.songs,
      score: result.score,
      insights: result.insights,
      message: result.score.overall >= 90
        ? 'Excellent setlist generated! Ready for performance.'
        : result.score.overall >= 75
          ? 'Solid setlist created. Minor adjustments recommended.'
          : 'Good starting point. Consider tweaking settings for better flow.',
    });
  } catch (error) {
    console.error('Setlist generation error:', error);
    return NextResponse.json({ error: 'Failed to generate setlist' }, { status: 500 });
  }
}

