import { NextResponse } from 'next/server';

import { handleApiError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';
import { getUsageSummary } from '@/lib/usage-tracking';

/**
 * GET /api/usage/summary
 * Returns current usage statistics for the authenticated user
 */
export async function GET() {
  try {
    const user = await requireAuth();
    const summary = await getUsageSummary(user.id);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error, { route: '/api/usage/summary', method: 'GET' });
  }
}

