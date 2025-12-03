/**
 * AI Track Generation Endpoint
 *
 * Generates AI music using Replicate's MusicGen model
 * - Authenticates via NextAuth
 * - Enforces usage quotas
 * - Uploads generated audio to Supabase Storage
 * - Creates song/track records in database
 */

import { prisma } from '@cronkwaters/db';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { z } from 'zod';

import { auth } from '@/auth';
import { aiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { trackUsage, getUsageSummary } from '@/lib/usage-tracking';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minute timeout for AI generation

// Validation schema - prompt is required, everything else is optional
const generateTrackSchema = z.object({
  prompt: z.string().min(1, 'Please describe what kind of track you want').max(500),
  instruments: z.array(z.string()).max(6).default([]),
  duration: z.number().min(5).max(30).default(15), // MusicGen max is ~30s
  tempo: z.number().min(60).max(200).default(120),
  seed: z.number().optional(),
  keySignature: z.string().optional(),
  projectId: z.string().optional(),
  songId: z.string().optional(),
});

// Server-side Supabase client for storage
function getSupabaseStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase storage configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Get Replicate client
function getReplicateClient() {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    return null;
  }

  return new Replicate({ auth: apiToken });
}

// Credit costs per tier
const CREDIT_COSTS = {
  base: 10, // Base cost for generation
  extraDuration: 5, // Per 10 seconds over 10s
  extraInstruments: 5, // If 4+ instruments
};

/**
 * POST /api/tracks/generate
 * Generate a new AI track with specified parameters
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    // Rate limit by user ID (20 requests per minute)
    await checkRateLimit(aiLimiter, userId);

    // Parse and validate request body
    const body = await req.json();
    const validatedData = generateTrackSchema.parse(body);

    // Validate prompt is provided
    if (!validatedData.prompt) {
      return NextResponse.json(
        { error: 'Please describe what kind of track you want' },
        { status: 400 }
      );
    }

    // 🔒 Check usage quotas
    const usage = await getUsageSummary(userId);

    // Calculate credits needed
    let creditsNeeded = CREDIT_COSTS.base;
    if (validatedData.duration > 10) {
      creditsNeeded += Math.ceil((validatedData.duration - 10) / 10) * CREDIT_COSTS.extraDuration;
    }
    if (validatedData.instruments.length > 3) {
      creditsNeeded += CREDIT_COSTS.extraInstruments;
    }

    // Check AI quota
    if (usage.ai.remaining < creditsNeeded) {
      return NextResponse.json(
        {
          error: `Insufficient AI credits. Need ${creditsNeeded}, have ${usage.ai.remaining}`,
          requiresUpgrade: true,
          tier: usage.tier,
          used: usage.ai.used,
          limit: usage.ai.limit,
          needed: creditsNeeded,
        },
        { status: 429 }
      );
    }

    // Check if Replicate is configured
    const replicate = getReplicateClient();
    if (!replicate) {
      // Demo mode: Generate a unique demo track for the user
      // This allows testing the full flow without requiring API keys
      const prompt = buildGenerationPrompt(validatedData);
      const trackTitle = generateTrackTitle(validatedData);

      // Create a song record with a demo audio placeholder
      // In production, you would configure REPLICATE_API_TOKEN for real AI generation
      const demoSong = await prisma.song.create({
        data: {
          title: `${trackTitle} (Demo)`,
          userId,
          tempo: validatedData.tempo,
          visibility: 'private',
          description: `AI Sketch: ${validatedData.prompt}\n\n${validatedData.instruments.length > 0 ? `Instruments: ${validatedData.instruments.join(', ')}\n` : ''}Duration: ${validatedData.duration}s | Tempo: ${validatedData.tempo} BPM\n\n[Demo Mode - Configure REPLICATE_API_TOKEN for real AI music generation]`,
          // No audio URL in demo mode - the song is a placeholder
          audioUrl: null,
          audioPath: null,
        },
      });

      console.log(`[AI Music Demo] Created demo track: ${demoSong.id}`);

      return NextResponse.json({
        success: true,
        mode: 'demo',
        message:
          'Demo mode: AI track placeholder created. Configure REPLICATE_API_TOKEN for real generation.',
        song: {
          id: demoSong.id,
          title: demoSong.title,
          audioUrl: null, // No audio in demo mode
          duration: validatedData.duration,
          instruments: validatedData.instruments,
        },
        songId: demoSong.id, // For project selector
        trackId: demoSong.id, // Legacy compatibility
        generation: {
          creditsUsed: 0, // Demo doesn't use credits
          model: 'demo-mode',
          prompt: prompt,
        },
        demo: {
          note: 'Real AI generation requires REPLICATE_API_TOKEN environment variable',
          documentation: 'https://replicate.com/meta/musicgen',
        },
      });
    }

    // Build prompt for MusicGen
    const prompt = buildGenerationPrompt(validatedData);

    // Track usage before generation (pre-deduct)
    await trackUsage(userId, 'aiRequests', creditsNeeded);

    // 🎵 Generate music using Replicate MusicGen
    console.log(`[AI Music] Generating track for user ${userId}:`);
    console.log(`[AI Music] Prompt: "${prompt.slice(0, 100)}..."`);
    console.log(
      `[AI Music] Duration: ${validatedData.duration}s, Tempo: ${validatedData.tempo} BPM`
    );

    let output: unknown;

    try {
      // Use the latest MusicGen stereo model
      // See: https://replicate.com/meta/musicgen
      output = await replicate.run(
        'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043ac92924f3550b9bdb1a48910f',
        {
          input: {
            prompt: prompt,
            duration: Math.min(validatedData.duration, 30), // MusicGen max is 30s
            model_version: 'stereo-large', // Options: melody, large, stereo-melody, stereo-large
            output_format: 'mp3',
            normalization_strategy: 'peak',
            ...(validatedData.seed !== undefined && { seed: validatedData.seed }),
          },
        }
      );

      console.log(`[AI Music] Replicate response type: ${typeof output}`);
      console.log(`[AI Music] Replicate response:`, JSON.stringify(output).slice(0, 200));
    } catch (replicateError: any) {
      console.error('[AI Music] Replicate API error:', replicateError);

      // Check for specific error types
      if (replicateError.message?.includes('Invalid model version')) {
        // Try with default model (no model_version specified) - this lets Replicate choose
        console.log('[AI Music] Retrying with default model (no model_version)...');
        output = await replicate.run('meta/musicgen', {
          input: {
            prompt: prompt,
            duration: Math.min(validatedData.duration, 30),
            output_format: 'mp3',
            // Omit model_version to use Replicate's default
          },
        });
      } else {
        throw replicateError;
      }
    }

    // MusicGen returns audio URL - could be string directly or in an object/array
    let audioUrl: string;

    if (typeof output === 'string') {
      audioUrl = output;
    } else if (Array.isArray(output) && output.length > 0 && typeof output[0] === 'string') {
      // Some versions return an array of URLs
      audioUrl = output[0];
    } else if (output && typeof output === 'object' && 'audio' in output) {
      // Some versions return { audio: "url" }
      audioUrl = (output as { audio: string }).audio;
    } else if (output && typeof output === 'object' && 'output' in output) {
      // Some versions return { output: "url" }
      audioUrl = (output as { output: string }).output;
    } else {
      console.error('[AI Music] Unexpected output format:', JSON.stringify(output));
      throw new Error('AI generation failed - unexpected response format');
    }

    if (!audioUrl || typeof audioUrl !== 'string' || !audioUrl.startsWith('http')) {
      console.error('[AI Music] Invalid audio URL:', audioUrl);
      throw new Error('AI generation failed - invalid audio URL returned');
    }

    console.log(`[AI Music] Generated audio URL: ${audioUrl.slice(0, 100)}...`);

    // Download the generated audio
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error('Failed to download generated audio');
    }
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    // Upload to Supabase Storage
    const supabase = getSupabaseStorageClient();
    const timestamp = Date.now();
    const filename = `ai-generated/${userId}/${timestamp}-${sanitizeFilename(prompt.slice(0, 30))}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to save generated audio');
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('audio-files').getPublicUrl(filename);

    // Calculate file size in GB for storage tracking
    const fileSizeGB = audioBuffer.length / (1024 * 1024 * 1024);

    // Update storage usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsedGB: { increment: fileSizeGB },
      },
    });

    // Create song record (genre and mood stored in description for now since Song model doesn't have these fields)
    const song = await prisma.song.create({
      data: {
        title: generateTrackTitle(validatedData),
        userId,
        tempo: validatedData.tempo,
        visibility: 'private',
        description: validatedData.prompt || prompt,
        audioUrl: urlData.publicUrl,
        audioPath: filename,
      },
    });

    console.log(`[AI Music] Track generated successfully: ${song.id}`);

    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        audioUrl: urlData.publicUrl,
        duration: validatedData.duration,
        instruments: validatedData.instruments,
      },
      songId: song.id, // For project selector
      trackId: song.id, // Legacy compatibility
      generation: {
        creditsUsed: creditsNeeded,
        model: 'musicgen-stereo-large',
        prompt: prompt,
      },
      storage: {
        path: filename,
        sizeBytes: audioBuffer.length,
      },
    });
  } catch (error) {
    console.error('POST /api/tracks/generate error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Replicate-specific errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return NextResponse.json(
        { error: 'AI service rate limit reached. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate track', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Build a comprehensive prompt for MusicGen
 */
function buildGenerationPrompt(params: z.infer<typeof generateTrackSchema>): string {
  const parts: string[] = [];

  // User's description is the primary input
  parts.push(params.prompt);

  // Instruments (if specified)
  if (params.instruments.length > 0) {
    parts.push(`featuring ${params.instruments.join(', ')}`);
  }

  // Tempo
  parts.push(`${params.tempo} BPM`);

  // Key signature
  if (params.keySignature && params.keySignature !== 'Auto') {
    parts.push(`in the key of ${params.keySignature}`);
  }

  return parts.join(', ');
}

/**
 * Generate a title for the track based on parameters
 */
function generateTrackTitle(params: z.infer<typeof generateTrackSchema>): string {
  // Extract a meaningful title from the prompt (first few words)
  const promptWords = params.prompt.split(' ').slice(0, 4).join(' ');
  const shortTitle = promptWords.length > 25 ? promptWords.slice(0, 25) + '...' : promptWords;

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${capitalize(shortTitle)} - ${timestamp}`;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Sanitize filename for storage
 */
function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * GET /api/tracks/generate
 * Check status of AI generation feature and verify configuration
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check all required configurations
    const replicate = getReplicateClient();
    const replicateConfigured = !!replicate;
    const replicateTokenPrefix = process.env.REPLICATE_API_TOKEN?.slice(0, 5) || 'NOT SET';

    // Check Supabase storage config
    let supabaseConfigured = false;
    let supabaseError: string | null = null;
    try {
      const supabase = getSupabaseStorageClient();
      supabaseConfigured = true;
    } catch (e: any) {
      supabaseError = e.message;
    }

    // Test Replicate connection if configured
    let replicateStatus = 'not_tested';
    let replicateError: string | null = null;

    if (replicateConfigured && replicate) {
      try {
        // Just verify the client can be created - don't make an actual API call
        // to avoid charges during health checks
        replicateStatus = 'configured';
      } catch (e: any) {
        replicateStatus = 'error';
        replicateError = e.message;
      }
    } else {
      replicateStatus = 'not_configured';
    }

    return NextResponse.json({
      status: replicateConfigured && supabaseConfigured ? 'ready' : 'incomplete',
      timestamp: new Date().toISOString(),
      configuration: {
        replicate: {
          configured: replicateConfigured,
          tokenPrefix: replicateTokenPrefix,
          status: replicateStatus,
          error: replicateError,
        },
        supabase: {
          configured: supabaseConfigured,
          error: supabaseError,
        },
      },
      model: 'meta/musicgen',
      capabilities: {
        maxDuration: 30,
        formats: ['mp3'],
        instrumentSupport: true,
      },
      pricing: {
        baseCost: CREDIT_COSTS.base,
        extraDuration: CREDIT_COSTS.extraDuration,
        extraInstruments: CREDIT_COSTS.extraInstruments,
      },
      troubleshooting: !replicateConfigured
        ? [
            'REPLICATE_API_TOKEN environment variable is not set',
            'Get your token from: https://replicate.com/account/api-tokens',
            'Token should start with "r8_"',
          ]
        : !supabaseConfigured
          ? [
              'Supabase storage is not configured',
              'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set',
            ]
          : [],
    });
  } catch (error) {
    console.error('GET /api/tracks/generate error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
