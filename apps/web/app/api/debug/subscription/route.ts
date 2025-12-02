import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { getUserSubscription as getSubscriptionInfo } from '@/lib/subscription';

/**
 * DEBUG ENDPOINT - Shows current user's session and subscription status
 * DELETE THIS AFTER DEBUGGING
 */
export async function GET() {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser?.id) {
      return NextResponse.json({
        error: 'Not authenticated',
        sessionUser: null,
      });
    }

    // Get raw database user
    const dbUser = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      },
    });

    // Get computed subscription info
    let subscriptionInfo = null;
    try {
      subscriptionInfo = await getSubscriptionInfo(sessionUser.id);
    } catch (err) {
      subscriptionInfo = { error: err instanceof Error ? err.message : 'Unknown error' };
    }

    return NextResponse.json({
      sessionUser: {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
      },
      dbUser,
      subscriptionInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug subscription error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
