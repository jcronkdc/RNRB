import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';

import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';
import { aiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { getCurrentUserId } from '@/lib/session';

/**
 * AI Stem Separation API - Professional Grade
 *
 * Uses Replicate API with HTDemucs (Hybrid Transformer Demucs) - the latest
 * and most accurate stem separation model from Meta AI Research.
 *
 * HTDemucs combines:
 * - Hybrid architecture (time + frequency domain)
 * - Transformer layers for better temporal modeling
 * - Cross-domain attention for cleaner separation
 *
 * Modes:
 * - 2-stem: Vocals + Instrumental (fastest, great for karaoke)
 * - 4-stem: Vocals, Drums, Bass, Other (balanced)
 * - 6-stem: + Guitar, Piano isolation (highest detail)
 *
 * Quality presets affect segment length:
 * - Fast: segment=20 (quicker, good quality)
 * - Balanced: segment=40 (default, better quality)
 * - High: segment=60 (slower, best quality)
 */

// Quality presets - longer segments = better quality but slower
const QUALITY_PRESETS = {
  fast: { segment: 20, overlap: 0.1, description: 'Quick processing (~1-2 min)' },
  balanced: { segment: 40, overlap: 0.25, description: 'Recommended (~3-5 min)' },
  high: { segment: 60, overlap: 0.5, description: 'Best quality (~6-10 min)' },
} as const;

// Model configurations - using latest HTDemucs models
const MODELS = {
  '2-stem': {
    // HTDemucs fine-tuned for vocal separation - best for karaoke/acapella
    id: 'cjwbw/demucs',
    version: 'cd128044253df92de732c08df8a7d4b34c3c6e3b1e2e59a5d3ea58b88d3c61ac',
    credits: 2,
    stems: ['vocals', 'instrumental'],
    description: 'Vocals + Instrumental',
    useCase: 'Karaoke, vocal practice, acapella extraction',
  },
  '4-stem': {
    // HTDemucs v4 - hybrid transformer model, significantly better than older Demucs
    id: 'cjwbw/demucs',
    version: 'cd128044253df92de732c08df8a7d4b34c3c6e3b1e2e59a5d3ea58b88d3c61ac',
    credits: 5,
    stems: ['vocals', 'drums', 'bass', 'other'],
    description: 'Full Band Separation',
    useCase: 'Learning parts, remixing, creating backing tracks',
  },
  '6-stem': {
    // HTDemucs 6-source model - isolates guitar and piano separately
    id: 'adefossez/demucs',
    version: '25a173108cff36ef9f80f854c162d01df9e6528be175794b81b7b8a6c45eb183',
    credits: 8,
    stems: ['vocals', 'drums', 'bass', 'guitar', 'piano', 'other'],
    description: 'Pro Separation + Guitar & Piano',
    useCase: 'Detailed transcription, advanced remixing, sample creation',
  },
} as const;

type SeparationMode = keyof typeof MODELS;
type QualityPreset = keyof typeof QUALITY_PRESETS;

interface SeparateRequest {
  audioUrl: string;
  mode: SeparationMode;
  quality?: QualityPreset; // Quality preset: fast, balanced, high
  songId?: string; // Optional: link to existing song for storage
  saveToLibrary?: boolean; // Auto-save stems to user's library
}

interface StemResult {
  name: string;
  url: string;
  duration?: number;
  confidence?: number; // Separation quality indicator (0-100)
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
    const { audioUrl, mode = '4-stem', quality = 'balanced', songId, saveToLibrary = false } = body;

    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(audioUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid audio URL format' }, { status: 400 });
    }

    // Get model and quality configuration
    const model = MODELS[mode] || MODELS['4-stem'];
    const qualityConfig = QUALITY_PRESETS[quality] || QUALITY_PRESETS['balanced'];

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

    // Start stem separation with quality settings
    const stemCount = mode === '2-stem' ? 2 : mode === '4-stem' ? 4 : 6;

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
            stems: stemCount,
            // Quality settings from preset
            segment: qualityConfig.segment,
            overlap: qualityConfig.overlap,
            // Use float32 for best quality output
            float32: quality === 'high',
            // Enable two-pass for high quality mode (better transients)
            two_pass: quality === 'high',
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

    // Estimated time based on quality preset
    const estimatedTimes = {
      fast: '1-2 minutes',
      balanced: '3-5 minutes',
      high: '6-10 minutes',
    };

    // Return prediction ID for polling
    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
      mode: mode,
      quality: quality,
      expectedStems: model.stems,
      creditsUsed: model.credits,
      songId: songId,
      saveToLibrary: saveToLibrary,
      estimatedTime: estimatedTimes[quality] || '3-5 minutes',
      qualityDescription: qualityConfig.description,
      pollUrl: `/api/stems/status/${prediction.id}`,
    });
  } catch (error) {
    console.error('[STEMS] Error:', error);
    return NextResponse.json({ error: 'Failed to process stem separation' }, { status: 500 });
  }
}

// GET /api/stems/separate - Get available modes and quality presets
export async function GET() {
  return NextResponse.json({
    modes: Object.entries(MODELS).map(([id, config]) => ({
      id,
      name: config.description,
      stems: config.stems,
      credits: config.credits,
      useCase: config.useCase,
    })),
    qualityPresets: Object.entries(QUALITY_PRESETS).map(([id, config]) => ({
      id,
      segment: config.segment,
      description: config.description,
    })),
    features: [
      'HTDemucs v4 - Latest AI model from Meta Research',
      'Hybrid Transformer architecture for cleaner separation',
      '3 quality presets: Fast, Balanced, High',
      'Isolate vocals, drums, bass, guitar, piano & more',
      'Perfect for remixes, learning parts, and practice',
      'Supports MP3, WAV, FLAC, M4A up to 50MB',
    ],
    tips: [
      'Use "Fast" for quick previews or simple vocal removal',
      'Use "Balanced" for most use cases (recommended)',
      'Use "High" when quality matters most (remixing, sampling)',
      '6-stem mode is best for songs with prominent guitar/piano',
      'Stems work great with our Backing Track Creator tool',
    ],
  });
}
