import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@cronkwaters/auth';
import { handleApiError } from '@/lib/errors';
import {
  savePushSubscription,
  removePushSubscription,
  getVapidPublicKey,
  isPushConfigured,
} from '@/lib/push-notifications';

/**
 * GET /api/push/subscribe
 * Get VAPID public key for push subscription
 */
export async function GET() {
  try {
    await requireAuth();

    if (!isPushConfigured()) {
      return NextResponse.json({ error: 'Push notifications are not configured' }, { status: 503 });
    }

    const vapidPublicKey = getVapidPublicKey();

    return NextResponse.json({
      vapidPublicKey,
      enabled: true,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/push/subscribe', method: 'GET' });
  }
}

/**
 * POST /api/push/subscribe
 * Subscribe to push notifications
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { subscription } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    if (!isPushConfigured()) {
      return NextResponse.json({ error: 'Push notifications are not configured' }, { status: 503 });
    }

    const success = await savePushSubscription(user.id, {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Successfully subscribed to push notifications',
      subscribed: true,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/push/subscribe', method: 'POST' });
  }
}

/**
 * DELETE /api/push/subscribe
 * Unsubscribe from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
    }

    const success = await removePushSubscription(user.id, endpoint);

    return NextResponse.json({
      message: 'Successfully unsubscribed from push notifications',
      subscribed: false,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/push/subscribe', method: 'DELETE' });
  }
}
