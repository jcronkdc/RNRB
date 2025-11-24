import { type NextRequest, NextResponse } from 'next/server';

import { getChatAssistance } from '@/lib/ai/openai';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { getCurrentUser } from '@/lib/supabase';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Check subscription access
    try {
      await requireFeatureAccess('aiChatAssist');
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || 'Upgrade to Creator or Studio plan to access AI features',
          requiresUpgrade: true,
          currentTier: error.tier || 'free',
        },
        { status: 403 }
      );
    }

    // 🔒 RATE LIMITING: Check usage quota
    try {
      await requireUsageQuota('aiRequests', 1);
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
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiResponse = await getChatAssistance(message, context || {});

    if (!aiResponse) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    // 📊 Track successful usage
    const user = await getCurrentUser();
    if (user) {
      await trackUsage(user.id, 'aiRequests', 1);
    }

    return NextResponse.json({
      suggestion: aiResponse,
      isAiGenerated: true,
      disclaimer: 'AI suggestion - use your creative judgment',
    });
  } catch (error: any) {
    console.error('AI chat assist error:', error);
    return NextResponse.json({ error: 'Failed to get AI assistance' }, { status: 500 });
  }
}
