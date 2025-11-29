import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';

import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';
import { aiLimiter, checkRateLimit } from '@/lib/rate-limit';
import { getCurrentUserId } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

/**
 * AI Album Art Generation API
 *
 * Uses Replicate API for image generation with multiple model options:
 * - flux-schnell: Fast, cheap (~$0.003) - great for drafts
 * - ideogram-v3-turbo: Best for text on artwork (~$0.03)
 * - flux-1.1-pro: Premium quality (~$0.06)
 *
 * Credit costs:
 * - Draft (schnell): 1 credit
 * - Standard (ideogram): 3 credits
 * - Premium (flux-pro): 5 credits
 */

// Style presets for album art generation
const STYLE_PRESETS: Record<string, { name: string; promptPrefix: string; promptSuffix: string }> =
  {
    'vinyl-classic': {
      name: 'Vinyl Classic',
      promptPrefix: 'Classic vinyl record album cover art, vintage aesthetic,',
      promptSuffix:
        ', retro color palette, nostalgic feel, professional album artwork, square format',
    },
    'neon-glow': {
      name: 'Neon Glow',
      promptPrefix: 'Neon glow aesthetic album cover,',
      promptSuffix:
        ', vibrant neon colors, dark background, synthwave style, electronic music vibes, professional album artwork',
    },
    'minimalist-modern': {
      name: 'Minimalist Modern',
      promptPrefix: 'Minimalist modern album cover design,',
      promptSuffix:
        ', clean lines, simple geometric shapes, contemporary art style, professional album artwork',
    },
    psychedelic: {
      name: 'Psychedelic',
      promptPrefix: 'Psychedelic album cover art,',
      promptSuffix:
        ', trippy visuals, vibrant swirling colors, 60s-70s inspired, mind-bending imagery, professional album artwork',
    },
    'dark-moody': {
      name: 'Dark & Moody',
      promptPrefix: 'Dark moody album cover,',
      promptSuffix:
        ', dramatic lighting, shadows, atmospheric, mysterious vibe, professional album artwork',
    },
    'hand-drawn': {
      name: 'Hand-Drawn',
      promptPrefix: 'Hand-drawn illustration album cover,',
      promptSuffix:
        ', artistic sketch style, ink drawing aesthetic, indie music feel, professional album artwork',
    },
    'abstract-art': {
      name: 'Abstract Art',
      promptPrefix: 'Abstract art album cover,',
      promptSuffix:
        ', bold colors, artistic expression, contemporary abstract painting style, professional album artwork',
    },
    photorealistic: {
      name: 'Photorealistic',
      promptPrefix: 'Photorealistic album cover,',
      promptSuffix:
        ', cinematic quality, professional photography style, dramatic composition, studio quality',
    },
    'grunge-rock': {
      name: 'Grunge Rock',
      promptPrefix: 'Grunge rock album cover,',
      promptSuffix:
        ', distressed textures, raw energy, 90s alternative rock aesthetic, gritty, professional album artwork',
    },
    'hip-hop': {
      name: 'Hip-Hop',
      promptPrefix: 'Hip-hop album cover art,',
      promptSuffix:
        ', urban aesthetic, bold typography space, street art influence, modern rap album style, professional artwork',
    },
    'dreamy-ethereal': {
      name: 'Dreamy Ethereal',
      promptPrefix: 'Dreamy ethereal album cover,',
      promptSuffix:
        ', soft pastel colors, floating elements, ambient music aesthetic, magical atmosphere, professional album artwork',
    },
    'nature-organic': {
      name: 'Nature Organic',
      promptPrefix: 'Nature-inspired organic album cover,',
      promptSuffix:
        ', natural elements, earth tones, botanical illustration style, folk music aesthetic, professional album artwork',
    },
  };

// Model configurations
const MODELS = {
  draft: {
    id: 'black-forest-labs/flux-schnell',
    credits: 1,
    description: 'Fast draft generation',
  },
  standard: {
    id: 'ideogram-ai/ideogram-v3-turbo',
    credits: 3,
    description: 'Good for text on artwork',
  },
  premium: {
    id: 'black-forest-labs/flux-1.1-pro',
    credits: 5,
    description: 'Highest quality',
  },
} as const;

type ModelTier = keyof typeof MODELS;

interface GenerateRequest {
  prompt: string;
  style: string;
  quality: ModelTier;
  count?: number; // Number of images to generate (1-4)
  songTitle?: string;
  artistName?: string;
  genre?: string;
  mood?: string;
}

// POST /api/artwork/generate
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit by user ID (20 requests per minute)
    await checkRateLimit(aiLimiter, session.user.id);

    // ✅ SECURITY: Check subscription access
    try {
      await requireFeatureAccess('aiAlbumArt');
    } catch (error: unknown) {
      const err = error as { message?: string; tier?: string };
      return NextResponse.json(
        {
          error:
            err.message || 'Upgrade to Creator or Studio plan to access AI album art generation',
          requiresUpgrade: true,
          currentTier: err.tier || 'free',
        },
        { status: 403 }
      );
    }

    const body = (await request.json()) as GenerateRequest;
    const {
      prompt,
      style,
      quality = 'draft',
      count = 1,
      songTitle,
      artistName,
      genre,
      mood,
    } = body;

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a description for your artwork' },
        { status: 400 }
      );
    }

    // Validate count (1-4 images per request)
    const imageCount = Math.min(Math.max(1, count), 4);

    // Get model configuration
    const model = MODELS[quality] || MODELS.draft;
    const totalCredits = model.credits * imageCount;

    // 🔒 RATE LIMITING: Check usage quota for total credits needed
    try {
      await requireUsageQuota('imageCredits', totalCredits);
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
            creditsNeeded: totalCredits,
          },
          { status: 429 }
        );
      }
      throw error;
    }

    // Build the full prompt
    const stylePreset = STYLE_PRESETS[style] || STYLE_PRESETS['minimalist-modern'];

    // Add context from song metadata
    let contextualPrompt = prompt;
    if (songTitle) contextualPrompt += `, for a song called "${songTitle}"`;
    if (artistName) contextualPrompt += `, artist: ${artistName}`;
    if (genre) contextualPrompt += `, ${genre} music`;
    if (mood) contextualPrompt += `, ${mood} mood`;

    const fullPrompt = `${stylePreset.promptPrefix} ${contextualPrompt}${stylePreset.promptSuffix}`;

    // Check for Replicate API token
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      console.error('[ARTWORK] Missing REPLICATE_API_TOKEN');
      return NextResponse.json(
        { error: 'Image generation service not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Generate images using Replicate API
    const generatedImages: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      try {
        // Create prediction (with 60s timeout for image generation)
        const createResponse = await fetchWithTimeout(
          'https://api.replicate.com/v1/predictions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${replicateToken}`,
              'Content-Type': 'application/json',
              Prefer: 'wait', // Wait for completion
            },
            body: JSON.stringify({
              version: getModelVersion(model.id),
              input: {
                prompt: fullPrompt,
                aspect_ratio: '1:1', // Square for album art
                output_format: 'webp',
                output_quality: 90,
                // Add slight variation for multiple images
                ...(imageCount > 1 && { seed: Math.floor(Math.random() * 1000000) + i * 1000 }),
              },
            }),
          },
          TIMEOUTS.IMAGE_GENERATION
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('[ARTWORK] Replicate API error:', errorText);
          continue;
        }

        const prediction = await createResponse.json();

        // If using "wait" header, result should be immediate
        if (prediction.status === 'succeeded' && prediction.output) {
          // Output can be a string or array depending on model
          const outputUrl = Array.isArray(prediction.output)
            ? prediction.output[0]
            : prediction.output;
          if (outputUrl) {
            generatedImages.push(outputUrl);
          }
        } else if (prediction.status === 'processing' || prediction.status === 'starting') {
          // Poll for completion if not using wait
          const completedPrediction = await pollForCompletion(prediction.id, replicateToken);
          if (completedPrediction?.output) {
            const outputUrl = Array.isArray(completedPrediction.output)
              ? completedPrediction.output[0]
              : completedPrediction.output;
            if (outputUrl) {
              generatedImages.push(outputUrl);
            }
          }
        }
      } catch (genError) {
        console.error('[ARTWORK] Image generation error:', genError);
        // Continue to try generating other images
      }
    }

    if (generatedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate images. Please try again.' },
        { status: 500 }
      );
    }

    // 📊 Track successful usage (only charge for images actually generated)
    const creditsUsed = model.credits * generatedImages.length;
    const userId = await getCurrentUserId();
    if (userId) {
      await trackUsage(userId, 'imageCredits', creditsUsed);
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      prompt: fullPrompt,
      style: stylePreset.name,
      model: model.id,
      creditsUsed,
      metadata: {
        songTitle,
        artistName,
        genre,
        mood,
      },
    });
  } catch (error) {
    console.error('[ARTWORK] Error:', error);
    return NextResponse.json({ error: 'Failed to generate artwork' }, { status: 500 });
  }
}

// GET /api/artwork/generate - Get available styles and models
export async function GET() {
  return NextResponse.json({
    styles: Object.entries(STYLE_PRESETS).map(([id, preset]) => ({
      id,
      name: preset.name,
    })),
    models: Object.entries(MODELS).map(([id, config]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      credits: config.credits,
      description: config.description,
    })),
  });
}

// Helper function to get model version hash
function getModelVersion(modelId: string): string {
  // These are the latest stable versions as of the web search results
  const versions: Record<string, string> = {
    'black-forest-labs/flux-schnell':
      'bf53bdb93d739c9c915091f7b22d42ee1045d1de0b9924c3067a8394d4adf3a6',
    'ideogram-ai/ideogram-v3-turbo':
      '0f74e1e9eed51a8bb8dad51b71499ad29b28f2e39b87af1ee18db5c89f834a0c',
    'black-forest-labs/flux-1.1-pro':
      'ea756c0dc46647f2c32a03ada3c37eec0b88ae0de17a41a3a2e49a0dc1cf3d84',
  };
  return versions[modelId] || versions['black-forest-labs/flux-schnell'];
}

// Helper function to poll for prediction completion
async function pollForCompletion(
  predictionId: string,
  token: string,
  maxAttempts = 30
): Promise<{ output?: string | string[]; status: string } | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between polls

    const response = await fetchWithTimeout(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      TIMEOUTS.STANDARD
    );

    if (!response.ok) {
      console.error('[ARTWORK] Poll error:', await response.text());
      return null;
    }

    const prediction = await response.json();

    if (prediction.status === 'succeeded') {
      return prediction;
    } else if (prediction.status === 'failed' || prediction.status === 'canceled') {
      console.error('[ARTWORK] Prediction failed:', prediction.error);
      return null;
    }
    // Continue polling if still processing
  }

  console.error('[ARTWORK] Polling timeout');
  return null;
}
