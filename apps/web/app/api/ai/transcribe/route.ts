import { NextRequest, NextResponse } from 'next/server';
import { transcribeSession, extractActionItems } from '@/lib/ai/openai';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';
import { getCurrentUser } from '@/lib/supabase';

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
      return NextResponse.json(
        { error: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Transcribe the session
    const transcription = await transcribeSession(audioUrl);

    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription service unavailable' },
        { status: 503 }
      );
    }

    let actionItems = null;
    if (extractActions) {
      actionItems = await extractActionItems(transcription);
    }

    // 📊 Track successful usage (transcription counts as 2 requests)
    const user = await getCurrentUser();
    if (user) {
      await trackUsage(user.id, 'aiRequests', 2);
    }

    return NextResponse.json({
      transcription,
      actionItems,
      disclaimer: 'AI-generated transcription - verify accuracy'
    });
  } catch (error: any) {
    console.error('AI transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe session' },
      { status: 500 }
    );
  }
}

