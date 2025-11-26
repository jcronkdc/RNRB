import { type NextRequest, NextResponse } from 'next/server';

import { generateContent } from '@/lib/ai/openai';
import { handleApiError } from '@/lib/errors';
import { getCurrentUserId } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Check subscription access
    try {
      await requireFeatureAccess('aiContentGeneration');
    } catch (error: any) {
      return NextResponse.json(
        {
          error:
            error.message || 'Upgrade to Creator or Studio plan to access AI content generation',
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
    const { type, context } = body;

    if (!type || !['social', 'email', 'press'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be: social, email, or press' },
        { status: 400 }
      );
    }

    const content = await generateContent(type, context || {});

    if (!content) {
      return NextResponse.json(
        { error: 'AI content generation unavailable. Check OPENAI_API_KEY.' },
        { status: 503 }
      );
    }

    // 📊 Track successful usage
    const userId = await getCurrentUserId();
    if (userId) {
      await trackUsage(userId, 'aiRequests', 1);
    }

    return NextResponse.json({
      content,
      type,
      isAiGenerated: true,
      disclaimer: 'AI-generated draft - edit before publishing',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/ai/generate-content', method: 'POST' });
  }
}
