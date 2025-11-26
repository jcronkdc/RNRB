import { type NextRequest, NextResponse } from 'next/server';

import { optimizeTourRoute } from '@/lib/ai/openai';
import { handleApiError } from '@/lib/errors';
import { getCurrentUserId } from '@/lib/session';
import { requireFeatureAccess } from '@/lib/subscription-access';
import { requireUsageQuota, trackUsage } from '@/lib/usage-tracking';

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Check subscription access
    try {
      await requireFeatureAccess('aiTourRouter');
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error.message || 'Upgrade to Creator or Studio plan to access AI tour routing',
          requiresUpgrade: true,
          currentTier: error.tier || 'free',
        },
        { status: 403 }
      );
    }

    // 🔒 RATE LIMITING: Check usage quota (tour routing counts as 2 requests due to complexity)
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
    const { venues } = body;

    if (!venues || !Array.isArray(venues) || venues.length < 2) {
      return NextResponse.json({ error: 'At least 2 venues required' }, { status: 400 });
    }

    const optimizedRoute = await optimizeTourRoute(venues);

    if (!optimizedRoute) {
      return NextResponse.json({ error: 'Tour routing service unavailable' }, { status: 503 });
    }

    // 📊 Track successful usage (tour routing counts as 2 requests)
    const userId = await getCurrentUserId();
    if (userId) {
      await trackUsage(userId, 'aiRequests', 2);
    }

    return NextResponse.json({
      optimizedRoute,
      method: 'AI ant colony optimization (Tokyo subway model)',
      disclaimer: 'AI-suggested routing - verify travel times and logistics',
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/ai/tour-router', method: 'POST' });
  }
}
