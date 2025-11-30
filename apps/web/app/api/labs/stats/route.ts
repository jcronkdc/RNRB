/**
 * R&R Labs Research Statistics API
 *
 * Provides comprehensive statistics for the research dashboard:
 * - Volunteer counts by status
 * - Audio/MIDI contribution totals
 * - Feedback submission counts
 * - Phase progress calculations
 */

import { type NextRequest, NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    let stats = {
      // Volunteer Stats
      volunteers: {
        total: 0,
        pending: 0,
        active: 0,
        contributing: 0,
        betaTesters: 0,
      },
      // Contribution Stats
      contributions: {
        totalAudioFiles: 0,
        totalMidiFiles: 0,
        totalAudioHours: 0,
        pendingReview: 0,
        approved: 0,
      },
      // Feedback Stats
      feedback: {
        total: 0,
        generatedAudio: 0,
        ui: 0,
        featureRequests: 0,
        bugs: 0,
        averageRating: 0,
      },
      // Research Phase Progress
      phases: {
        current: 1,
        dataCollection: 15, // Percentage
        modelArchitecture: 0,
        training: 0,
        betaRelease: 0,
      },
      // Milestones
      milestones: {
        volunteersTarget: 100,
        audioHoursTarget: 1000,
        midiFilesTarget: 500,
        feedbackTarget: 200,
      },
    };

    try {
      const { prisma: db } = await import('@cronkwaters/db');

      // Get volunteer counts by status
      const volunteerCounts = await db.labsVolunteer.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      let totalVolunteers = 0;
      volunteerCounts.forEach((item) => {
        const count = item._count.id;
        totalVolunteers += count;
        switch (item.status) {
          case 'pending':
            stats.volunteers.pending = count;
            break;
          case 'active':
            stats.volunteers.active = count;
            break;
          case 'contributing':
            stats.volunteers.contributing = count;
            break;
          case 'beta_tester':
            stats.volunteers.betaTesters = count;
            break;
        }
      });
      stats.volunteers.total = totalVolunteers;

      // Get contribution stats
      const contributionStats = await db.labsContribution.groupBy({
        by: ['type', 'status'],
        _count: { id: true },
        _sum: { duration: true },
      });

      contributionStats.forEach((item) => {
        if (item.type === 'audio') {
          stats.contributions.totalAudioFiles += item._count.id;
          // Duration is in seconds, convert to hours
          if (item._sum.duration) {
            stats.contributions.totalAudioHours += item._sum.duration / 3600;
          }
        } else if (item.type === 'midi') {
          stats.contributions.totalMidiFiles += item._count.id;
        }
        if (item.status === 'pending') {
          stats.contributions.pendingReview += item._count.id;
        } else if (item.status === 'approved') {
          stats.contributions.approved += item._count.id;
        }
      });

      // Round audio hours
      stats.contributions.totalAudioHours =
        Math.round(stats.contributions.totalAudioHours * 10) / 10;

      // Get feedback stats
      const feedbackStats = await db.labsFeedback.groupBy({
        by: ['targetType'],
        _count: { id: true },
        _avg: { rating: true },
      });

      let totalFeedback = 0;
      let totalRating = 0;
      let ratingCount = 0;

      feedbackStats.forEach((item) => {
        totalFeedback += item._count.id;
        if (item._avg.rating) {
          totalRating += item._avg.rating * item._count.id;
          ratingCount += item._count.id;
        }
        switch (item.targetType) {
          case 'generated_audio':
            stats.feedback.generatedAudio = item._count.id;
            break;
          case 'ui':
            stats.feedback.ui = item._count.id;
            break;
          case 'feature_request':
            stats.feedback.featureRequests = item._count.id;
            break;
          case 'bug':
            stats.feedback.bugs = item._count.id;
            break;
        }
      });

      stats.feedback.total = totalFeedback;
      stats.feedback.averageRating =
        ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0;

      // Calculate phase progress based on actual data
      const volunteersProgress = Math.min(
        100,
        Math.round((totalVolunteers / stats.milestones.volunteersTarget) * 100)
      );
      const audioProgress = Math.min(
        100,
        Math.round((stats.contributions.totalAudioHours / stats.milestones.audioHoursTarget) * 100)
      );
      const midiProgress = Math.min(
        100,
        Math.round((stats.contributions.totalMidiFiles / stats.milestones.midiFilesTarget) * 100)
      );
      const feedbackProgress = Math.min(
        100,
        Math.round((totalFeedback / stats.milestones.feedbackTarget) * 100)
      );

      // Data collection phase is average of all collection metrics
      stats.phases.dataCollection = Math.round(
        (volunteersProgress + audioProgress + midiProgress + feedbackProgress) / 4
      );

      // Model architecture starts when data collection hits 50%
      if (stats.phases.dataCollection >= 50) {
        stats.phases.modelArchitecture = Math.min(100, (stats.phases.dataCollection - 50) * 2);
        stats.phases.current = 2;
      }

      // Training starts when model architecture hits 80%
      if (stats.phases.modelArchitecture >= 80) {
        stats.phases.training = Math.min(100, (stats.phases.modelArchitecture - 80) * 5);
        stats.phases.current = 3;
      }

      // Beta release starts when training hits 90%
      if (stats.phases.training >= 90) {
        stats.phases.betaRelease = Math.min(100, (stats.phases.training - 90) * 10);
        stats.phases.current = 4;
      }
    } catch (dbError) {
      // Database not ready, return default stats
      console.warn('[Labs Stats] Database not ready:', dbError);
    }

    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error, { route: '/api/labs/stats', method: 'GET' });
  }
}
