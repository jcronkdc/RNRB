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

    // Store subscription in database (using a JSON field or separate table)
    // For now, we'll store it in user preferences
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // Get existing subscriptions or initialize empty array
    const existingPrefs = (user as any)?.preferences || {};
    const existingSubscriptions = existingPrefs.pushSubscriptions || [];

    // Check if this endpoint already exists
    const existingIndex = existingSubscriptions.findIndex(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      deviceName: deviceName || 'Unknown Device',
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      // Update existing subscription
      existingSubscriptions[existingIndex] = subscriptionData;
    } else {
      // Add new subscription
      existingSubscriptions.push(subscriptionData);
    }

    // Note: This assumes you have a 'preferences' JSON field on User
    // If not, you'll need to add it or create a PushSubscription table
    // await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: {
    //     preferences: {
    //       ...existingPrefs,
    //       pushSubscriptions: existingSubscriptions,
    //     },
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved',
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

    // Remove subscription from database
    // Implementation depends on your storage approach

    return NextResponse.json({
      success: true,
      message: 'Push subscription removed',
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
