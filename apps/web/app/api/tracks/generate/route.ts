import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { trackUsage } from '@/lib/usage-tracking';

const generateTrackSchema = z.object({
  prompt: z.string().min(1).max(500).optional(),
  genres: z.array(z.string()).max(3).default([]),
  moods: z.array(z.string()).max(3).default([]),
  instruments: z.array(z.string()).max(6).default([]),
  duration: z.number().min(15).max(180).default(30),
  tempo: z.number().min(60).max(200).default(120),
  seed: z.string().optional(),
  keySignature: z.string().optional(),
});

/**
 * POST /api/tracks/generate
 * Generate a new AI track with specified parameters
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = generateTrackSchema.parse(body);

    // Validate that at least one input is provided
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

    // Get user's subscription info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        aiRequestsUsed: true,
        usagePeriodStart: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate credits needed
    let creditsNeeded = 10; // Base cost
    if (validatedData.duration > 60) creditsNeeded += 5;
    if (validatedData.duration > 120) creditsNeeded += 10;
    if (validatedData.instruments.length > 4) creditsNeeded += 5;

    // Check subscription limits (example limits)
    const monthlyLimits: Record<string, number> = {
      free: 50,
      creator: 500,
      studio: 5000,
    };

    const userLimit = monthlyLimits[user.subscriptionTier] || monthlyLimits.free;

    if (user.aiRequestsUsed + creditsNeeded > userLimit) {
      return NextResponse.json(
        {
          error: 'Monthly AI usage limit reached',
          limit: userLimit,
          used: user.aiRequestsUsed,
          needed: creditsNeeded,
        },
        { status: 429 }
      );
    }

    // Track usage
    await trackUsage(userId, 'aiRequests', creditsNeeded);

    // Build prompt for AI generation
    const fullPrompt = buildGenerationPrompt(validatedData);

    // TODO: Integrate with actual AI music generation service
    // For now, this is a placeholder that would integrate with:
    // - Suno API
    // - Stable Audio
    // - MusicGen
    // - Custom trained model

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a song record to store the generated track
    const song = await db.song.create({
      data: {
        title: generateTrackTitle(validatedData),
        userId,
        genre: validatedData.genres[0] || null,
        mood: validatedData.moods[0] || null,
        tempo: validatedData.tempo,
        visibility: 'private',
        lyrics: null,
        chords: null,
        description: validatedData.prompt || null,
        metadata: {
          generated: true,
          generationParams: validatedData,
          creditsUsed: creditsNeeded,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // TODO: After AI generation completes, create track records
    // For now, return placeholder response
    return NextResponse.json(
      {
        success: true,
        trackId: song.id,
        songId: song.id,
        message: 'Track generation initiated',
        creditsUsed: creditsNeeded,
        estimatedTime: '20-30 seconds',
        status: 'generating',
      },
      { status: 202 } // 202 Accepted - processing
    );
  } catch (error) {
    console.error('POST /api/tracks/generate error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid input parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate track',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Build a comprehensive prompt for AI music generation
 */
function buildGenerationPrompt(params: z.infer<typeof generateTrackSchema>): string {
  const parts: string[] = [];

  if (params.prompt) {
    parts.push(params.prompt);
  }

  if (params.genres.length > 0) {
    parts.push(`Genre: ${params.genres.join(', ')}`);
  }

  if (params.moods.length > 0) {
    parts.push(`Mood: ${params.moods.join(', ')}`);
  }

  if (params.instruments.length > 0) {
    parts.push(`Instruments: ${params.instruments.join(', ')}`);
  }

  parts.push(`Duration: ${params.duration} seconds`);
  parts.push(`Tempo: ${params.tempo} BPM`);

  if (params.keySignature && params.keySignature !== 'Auto') {
    parts.push(`Key: ${params.keySignature}`);
  }

  return parts.join('. ');
}

/**
 * Generate a title for the track based on parameters
 */
function generateTrackTitle(params: z.infer<typeof generateTrackSchema>): string {
  const parts: string[] = [];

  if (params.moods.length > 0) {
    parts.push(params.moods[0]);
  }

  if (params.genres.length > 0) {
    parts.push(params.genres[0]);
  }

  parts.push('Track');

  const title = parts.join(' ');
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${title} - ${timestamp}`;
}






