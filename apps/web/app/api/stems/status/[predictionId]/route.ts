import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';

import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';

/**
 * Stem Separation Status API
 *
 * Poll this endpoint to check the status of a stem separation job
 * and retrieve the resulting stem URLs when complete.
 */

interface StemOutput {
  vocals?: string;
  drums?: string;
  bass?: string;
  other?: string;
  guitar?: string;
  piano?: string;
  instrumental?: string;
}

// GET /api/stems/status/[predictionId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ predictionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { predictionId } = await params;

    if (!predictionId) {
      return NextResponse.json({ error: 'Prediction ID is required' }, { status: 400 });
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN;
    if (!replicateToken) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
    }

    // Get prediction status from Replicate
    const response = await fetchWithTimeout(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${replicateToken}`,
        },
      },
      TIMEOUTS.STANDARD
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Prediction not found' }, { status: 404 });
      }
      const errorText = await response.text();
      console.error('[STEMS] Status check error:', errorText);
      return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
    }

    const prediction = await response.json();

    // Map status to user-friendly response
    const statusResponse: {
      status: string;
      progress?: number;
      stems?: StemOutput;
      error?: string;
      startedAt?: string;
      completedAt?: string;
      processingTime?: number;
    } = {
      status: prediction.status,
    };

    switch (prediction.status) {
      case 'starting':
        statusResponse.progress = 0;
        break;

      case 'processing':
        // Estimate progress based on logs if available
        statusResponse.progress = 50;
        break;

      case 'succeeded':
        statusResponse.progress = 100;
        statusResponse.stems = parseOutput(prediction.output);
        statusResponse.completedAt = prediction.completed_at;
        if (prediction.started_at && prediction.completed_at) {
          statusResponse.processingTime = Math.round(
            (new Date(prediction.completed_at).getTime() -
              new Date(prediction.started_at).getTime()) /
              1000
          );
        }
        break;

      case 'failed':
        statusResponse.error = prediction.error || 'Stem separation failed';
        break;

      case 'canceled':
        statusResponse.error = 'Stem separation was canceled';
        break;
    }

    statusResponse.startedAt = prediction.started_at;

    return NextResponse.json(statusResponse);
  } catch (error) {
    console.error('[STEMS] Status error:', error);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}

// Parse Demucs output into organized stem object
function parseOutput(output: unknown): StemOutput {
  // Demucs output format varies by model version
  // Can be an object with stem names as keys, or an array of URLs

  if (!output) return {};

  if (typeof output === 'object' && !Array.isArray(output)) {
    // Object format: { vocals: url, drums: url, ... }
    return output as StemOutput;
  }

  if (Array.isArray(output)) {
    // Array format: [vocals_url, drums_url, bass_url, other_url]
    const stems: StemOutput = {};
    const stemOrder = ['vocals', 'drums', 'bass', 'other', 'guitar', 'piano'];
    output.forEach((url, index) => {
      if (index < stemOrder.length && typeof url === 'string') {
        const stemName = stemOrder[index];
        if (stemName) {
          (stems as Record<string, string>)[stemName] = url;
        }
      }
    });
    return stems;
  }

  // Single URL (shouldn't happen but handle gracefully)
  if (typeof output === 'string') {
    return { other: output };
  }

  return {};
}
