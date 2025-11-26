import { type NextRequest, NextResponse } from 'next/server';

import { transcribeSession, extractActionItems } from '@/lib/ai/openai';
import { handleApiError } from '@/lib/errors';
import { getCurrentUserId } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Check subscription access
    try {
      await requireFeatureAccess('aiTranscription');
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || 'Upgrade to Creator or Studio plan to access AI transcription',
          requiresUpgrade: true,
          currentTier: error.tier || 'free',
        },
        { status: 403 }
      );
    }

    // 🔒 RATE LIMITING: Check usage quota (transcription counts as 2 requests)
    try {
      await requireUsageQuota('aiRequests', 2);
    } catch (error: any) {
      if (error.code === 'QUOTA_EXCEEDED') {
        return NextResponse.json(
          {
            error: error.message,
            requiresUpgrade: true,
            tier: error.tier,
            used: error.used,
            limit: error.limit,
            resetDate: error.resetDate,
          },
          { status: 429 } // Too Many Requests
        );
      }
      throw error;
    }

    const body = await request.json();
    const { audioUrl, extractActions } = body;

    if (!audioUrl || typeof audioUrl !== 'string') {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    // Transcribe the session
    const transcription = await transcribeSession(audioUrl);

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription service unavailable' }, { status: 503 });
    }

    let actionItems = null;
    if (extractActions) {
      actionItems = await extractActionItems(transcription);
    }

    // 📊 Track successful usage (transcription counts as 2 requests)
    const userId = await getCurrentUserId();
    if (userId) {
      await trackUsage(userId, 'aiRequests', 2);
    }

    return NextResponse.json({
      transcription,
      actionItems,
      disclaimer: 'AI-generated transcription - verify accuracy',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/ai/transcribe', method: 'POST' });
  }
}
