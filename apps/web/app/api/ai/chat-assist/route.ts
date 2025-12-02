import { type NextRequest, NextResponse } from 'next/server';

import { getChatAssistance } from '@/lib/ai/openai';
import { handleApiError } from '@/lib/errors';
import { getCurrentUserId } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

// Force dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic';

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
    const userId = await getCurrentUserId();
    if (userId) {
      await trackUsage(userId, 'aiRequests', 1);
    }

    return NextResponse.json({
      suggestion: aiResponse,
      isAiGenerated: true,
      disclaimer: 'AI suggestion - use your creative judgment',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/ai/chat-assist', method: 'POST' });
  }
}
