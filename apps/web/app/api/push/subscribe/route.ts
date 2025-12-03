/**
 * Web Push Subscription API
 *
 * Handles push notification subscriptions for:
 * - New messages in bookings
 * - Setlist updates from collaborators
 * - New booking requests (for providers)
 * - Release status updates
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

// Configure web-push with VAPID keys
// Generate keys: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@rocknrollbasement.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/**
 * POST - Subscribe to push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Push notifications not configured' }, { status: 501 });
    }

    const body = await request.json();
    const { subscription, deviceName } = body;

    if (!subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    // Validate required keys from the subscription
    const { p256dh, auth: authKey } = subscription.keys;
    if (!p256dh || !authKey) {
      return NextResponse.json({ error: 'Invalid subscription keys' }, { status: 400 });
    }

    // Use upsert to create or update the subscription
    // This handles the case where a user re-subscribes from the same device
    const pushSubscription = await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh,
        auth: authKey,
        deviceName: deviceName || 'Unknown Device',
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh,
        auth: authKey,
        deviceName: deviceName || 'Unknown Device',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved',
      subscriptionId: pushSubscription.id,
    });
  } catch (error) {
    console.error('[PUSH_SUBSCRIBE] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE - Unsubscribe from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    // Remove subscription from database using the compound unique key
    const deleted = await prisma.pushSubscription.deleteMany({
      where: {
        userId: session.user.id,
        endpoint: endpoint,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Subscription not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed',
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error('[PUSH_UNSUBSCRIBE] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * GET - Get VAPID public key for client
 */
export async function GET() {
  if (!VAPID_PUBLIC_KEY) {
    return NextResponse.json({ error: 'Push notifications not configured' }, { status: 501 });
  }

  return NextResponse.json({
    publicKey: VAPID_PUBLIC_KEY,
  });
}
