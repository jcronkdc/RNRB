import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { generateOptimalSetlist, type OptimizerOptions } from '@/lib/ai/setlist-optimizer';
import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';
import { generateSetlistSchema, parseBody } from '@/lib/validations';
import { requireFeatureAccess, SubscriptionError } from '@/lib/subscription';

/**
 * POST /api/setlists/generate
 * Generate an AI-optimized setlist from available songs
 * REQUIRES: Creator or Studio subscription
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check subscription access - FEATURE GATE
    try {
      await requireFeatureAccess(user.id, 'setlistManagement');
    } catch (error) {
      if (error instanceof SubscriptionError) {
        throw AppError.subscriptionRequired('Setlist Generation', error.requiredTier || 'creator');
      }
      throw error;
    }

    // Validate input with Zod schema
    const validated = await parseBody(request, generateSetlistSchema);

    // Verify user has access to project
    const project = await db.project.findUnique({
      where: { id: validated.projectId },
      include: {
        members: {
          where: { userId: user.id },
        },
        songs: {
          orderBy: { title: 'asc' },
        },
      },
    });

    if (!project) {
      throw AppError.notFound('Project');
    }

    if (project.members.length === 0) {
      throw AppError.forbidden('You do not have access to this project');
    }

    if (project.songs.length === 0) {
      throw AppError.badRequest('No songs in project to generate setlist from');
    }

    // Build optimizer options
    const options: OptimizerOptions = {
      targetDuration: validated.targetDuration,
      energyProfile: validated.energyProfile,
      requiredSongs: validated.requiredSongs,
      excludedSongs: validated.excludedSongs,
      openingSong: validated.openingSong || undefined,
      closingSong: validated.closingSong || undefined,
      avoidKeyJumps: validated.avoidKeyJumps,
      genreBalance: validated.genreBalance,
      allowedDeviation: 5,
    };

    // Generate optimized setlist
    const result = generateOptimalSetlist(project.songs, options);

    return NextResponse.json({
      songs: result.songs,
      score: result.score,
      insights: result.insights,
      message:
        result.score.overall >= 80
          ? 'Great setlist generated! Ready for performance.'
          : result.score.overall >= 60
            ? 'Solid setlist created. Minor adjustments recommended.'
            : 'Good starting point. Consider tweaking settings for better flow.',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/setlists/generate', method: 'POST' });
  }
}
