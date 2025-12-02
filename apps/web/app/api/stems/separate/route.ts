import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';

import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';
import { aiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { getCurrentUserId } from '@/lib/session';

/**
 * AI Stem Separation API - Moises.ai Replacement
 *
 * Uses Replicate API with Demucs model to separate audio into stems:
 * - Vocals
 * - Drums
 * - Bass
 * - Other (guitar, keys, etc.)
 *
 * Credit costs:
 * - 2-stem (vocals/instrumental): 2 credits
 * - 4-stem (vocals/drums/bass/other): 5 credits
 * - 6-stem (htdemucs_6s): 8 credits
 */

// Model configurations
const MODELS = {
  '2-stem': {
    id: 'cjwbw/demucs',
    version: 'cd128044-8c0c-4d7c-b49c-f1c1b3d91d5d',
    credits: 2,
    stems: ['vocals', 'instrumental'],
    description: 'Vocals + Instrumental',
  },
  '4-stem': {
    id: 'cjwbw/demucs',
    version: 'cd128044-8c0c-4d7c-b49c-f1c1b3d91d5d',
    credits: 5,
    stems: ['vocals', 'drums', 'bass', 'other'],
    description: 'Vocals, Drums, Bass, Other',
  },
  '6-stem': {
    id: 'adefossez/demucs',
    version: '25a173108cff36ef9f80f854c162d01df9e6528be175794b81b7b8a6c45eb183',
    credits: 8,
    stems: ['vocals', 'drums', 'bass', 'guitar', 'piano', 'other'],
    description: 'Full separation with guitar and piano',
  },
} as const;

type SeparationMode = keyof typeof MODELS;

interface SeparateRequest {
  audioUrl: string;
  mode: SeparationMode;
  songId?: string; // Optional: link to existing song for storage
}

interface StemResult {
  name: string;
  url: string;
  duration?: number;
}

// POST /api/stems/separate
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit (10 requests per minute - stem separation is expensive)
    await checkRateLimit(aiLimiter, session.user.id);

    // Check subscription access
    try {
      await requireFeatureAccess('stemSeparation');
    } catch (error: unknown) {
      const err = error as { message?: string; tier?: string };
      return NextResponse.json(
        {
          error: err.message || 'Upgrade to Creator or Studio plan to access stem separation',
          requiresUpgrade: true,
          currentTier: err.tier || 'free',
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as SeparateRequest;
    const { audioUrl, mode = '4-stem', songId } = body;

    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(audioUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid audio URL format' }, { status: 400 });
    }

    // Get model configuration
    const model = MODELS[mode] || MODELS['4-stem'];

    // Check usage quota
    try {
      await requireUsageQuota('stemCredits', model.credits);
    } catch (error: unknown) {
      const err = error as {
        code?: string;
        message?: string;
        tier?: string;
        used?: number;
        limit?: number;
        resetDate?: Date;
      };
      if (err.code === 'QUOTA_EXCEEDED') {
        return NextResponse.json(
          {
            error: err.message,
            requiresUpgrade: true,
            tier: err.tier,
            used: err.used,
            limit: err.limit,
            resetDate: err.resetDate,
            creditsNeeded: model.credits,
          },
          { status: 429 }
        );
      }
      throw error;
    }

    // Check for Replicate API token
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      console.error('[STEMS] Missing REPLICATE_API_TOKEN');
      return NextResponse.json(
        { error: 'Stem separation service not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Start stem separation
    const createResponse = await fetchWithTimeout(
      'https://api.replicate.com/v1/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: model.version,
          input: {
            audio: audioUrl,
            stems: mode === '2-stem' ? 2 : mode === '4-stem' ? 4 : 6,
            // Segment length for processing (shorter = faster, longer = better quality)
            segment: 40,
          },
          webhook: `${process.env.NEXTAUTH_URL}/api/webhooks/stems`,
          webhook_events_filter: ['completed'],
        }),
      },
      TIMEOUTS.STANDARD
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('[STEMS] Replicate API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to start stem separation. Please try again.' },
        { status: 500 }
      );
    }

    const prediction = await createResponse.json();

    // Track usage immediately (refund if webhook reports failure)
    const userId = await getCurrentUserId();
    if (userId) {
      await trackUsage(userId, 'stemCredits', model.credits);
    }

    // Return prediction ID for polling
    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
      mode: mode,
      expectedStems: model.stems,
      creditsUsed: model.credits,
      songId: songId,
      // Estimated processing time based on file size
      estimatedTime: '2-5 minutes',
      pollUrl: `/api/stems/status/${prediction.id}`,
    });
  } catch (error) {
    console.error('[STEMS] Error:', error);
    return NextResponse.json({ error: 'Failed to process stem separation' }, { status: 500 });
  }
}

// GET /api/stems/separate - Get available modes
export async function GET() {
  return NextResponse.json({
    modes: Object.entries(MODELS).map(([id, config]) => ({
      id,
      name: config.description,
      stems: config.stems,
      credits: config.credits,
    })),
    features: [
      'AI-powered stem separation',
      'Isolate vocals, drums, bass, and more',
      'Perfect for remixes and practice',
      'Works with any audio file',
    ],
  });
}
