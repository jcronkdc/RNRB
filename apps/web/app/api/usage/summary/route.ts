import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import { getUsageSummary } from '@/lib/usage-tracking';

/**
 * GET /api/usage/summary
 * Returns current usage statistics for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const summary = await getUsageSummary(user.id);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Usage summary error:', error);
    return NextResponse.json({ error: 'Failed to load usage summary' }, { status: 500 });
  }
}

