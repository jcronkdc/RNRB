/**
 * AI Track Generation Endpoint
 *
 * Generates AI music using Replicate's MusicGen model
 * - Authenticates via NextAuth
 * - Enforces usage quotas
 * - Uploads generated audio to Supabase Storage
 * - Creates song/track records in database
 */

import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { z } from 'zod';

import { prisma } from '@cronkwaters/db';

import { auth } from '@/auth';
import { trackUsage, getUsageSummary } from '@/lib/usage-tracking';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minute timeout for AI generation

// Validation schema
const generateTrackSchema = z.object({
  prompt: z.string().min(1).max(500).optional(),
  genres: z.array(z.string()).max(3).default([]),
  moods: z.array(z.string()).max(3).default([]),
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

    // Parse and validate request body
    const body = await req.json();
    const validatedData = generateTrackSchema.parse(body);

    // Validate at least one input is provided
    if (
      !validatedData.prompt &&
      validatedData.genres.length === 0 &&
      validatedData.moods.length === 0
    ) {
      return NextResponse.json(
        { error: 'Please provide a prompt or select at least one genre/mood' },
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
      // Return mock response if no API key (development mode)
      return NextResponse.json({
        success: true,
        mode: 'preview',
        message: 'AI Music Generation is in beta. Configure REPLICATE_API_TOKEN to enable.',
        preview: {
          prompt: buildGenerationPrompt(validatedData),
          creditsNeeded,
          estimatedTime: '20-30 seconds',
        },
      });
    }

    // Build prompt for MusicGen
    const prompt = buildGenerationPrompt(validatedData);

    // Track usage before generation (pre-deduct)
    await trackUsage(userId, 'aiRequests', creditsNeeded);

    // 🎵 Generate music using Replicate MusicGen
    console.log(`[AI Music] Generating track: "${prompt.slice(0, 50)}..."`);

    const output = await replicate.run(
      'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043ac92924f3550b9bdb1a48910f',
      {
        input: {
          prompt: prompt,
          duration: validatedData.duration,
          model_version: 'stereo-melody-large',
          output_format: 'mp3',
          normalization_strategy: 'peak',
          seed: validatedData.seed,
        },
      }
    );

    // MusicGen returns a URL to the generated audio
    const audioUrl = output as string;

    if (!audioUrl || typeof audioUrl !== 'string') {
      throw new Error('AI generation failed - no audio URL returned');
    }

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

    // Create song record
    const song = await prisma.song.create({
      data: {
        title: generateTrackTitle(validatedData),
        userId,
        genre: validatedData.genres[0] || null,
        mood: validatedData.moods[0] || null,
        tempo: validatedData.tempo,
        visibility: 'private',
        description: validatedData.prompt || prompt,
        metadata: {
          generated: true,
          generationParams: validatedData,
          creditsUsed: creditsNeeded,
          generatedAt: new Date().toISOString(),
          model: 'musicgen-stereo-melody-large',
          audioPath: filename,
          audioUrl: urlData.publicUrl,
          duration: validatedData.duration,
          fileSize: audioBuffer.length,
        },
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
        genre: song.genre,
        mood: song.mood,
      },
      generation: {
        creditsUsed: creditsNeeded,
        model: 'musicgen-stereo-melody-large',
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

  // User's custom prompt first
  if (params.prompt) {
    parts.push(params.prompt);
  }

  // Genre styling
  if (params.genres.length > 0) {
    parts.push(`${params.genres.join(' and ')} style`);
  }

  // Mood/atmosphere
  if (params.moods.length > 0) {
    parts.push(`${params.moods.join(', ')} feeling`);
  }

  // Instruments (if specific)
  if (params.instruments.length > 0) {
    parts.push(`featuring ${params.instruments.join(', ')}`);
  }

  // Tempo
  parts.push(`${params.tempo} BPM`);

  // Key signature
  if (params.keySignature && params.keySignature !== 'Auto') {
    parts.push(`in the key of ${params.keySignature}`);
  }

  return parts.join(', ') || 'instrumental music track';
}

/**
 * Generate a title for the track based on parameters
 */
function generateTrackTitle(params: z.infer<typeof generateTrackSchema>): string {
  const parts: string[] = [];

  if (params.moods.length > 0) {
    parts.push(capitalize(params.moods[0]));
  }

  if (params.genres.length > 0) {
    parts.push(capitalize(params.genres[0]));
  }

  if (parts.length === 0) {
    parts.push('AI');
  }

  parts.push('Track');

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${parts.join(' ')} - ${timestamp}`;
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
 * GET /api/tracks/generate/status/:id
 * Check status of a generation job (for async generation)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Return info about AI generation feature
    const replicate = getReplicateClient();

    return NextResponse.json({
      available: !!replicate,
      model: 'meta/musicgen',
      capabilities: {
        maxDuration: 30,
        formats: ['mp3'],
        genreSupport: true,
        moodSupport: true,
        instrumentSupport: true,
      },
      pricing: {
        baseCost: CREDIT_COSTS.base,
        extraDuration: CREDIT_COSTS.extraDuration,
        extraInstruments: CREDIT_COSTS.extraInstruments,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
