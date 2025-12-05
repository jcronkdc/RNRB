/**
 * Web Push Notifications Service
 *
 * Sends browser push notifications for:
 * - "Going live" alerts when followed artists start streaming
 * - Meeting reminders
 * - Important app events
 */

import webpush from 'web-push';
import { db } from '@/lib/db';

// Initialize web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@rnrb.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  vibrate?: number[];
  requireInteraction?: boolean;
}

/**
 * Check if push notifications are configured
 */
export function isPushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null;
}

/**
 * Save push subscription for a user
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<boolean> {
  try {
    await db.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return false;
  }
}

/**
 * Remove push subscription for a user
 */
export async function removePushSubscription(userId: string, endpoint: string): Promise<boolean> {
  try {
    await db.pushSubscription.delete({
      where: {
        userId_endpoint: {
          userId,
          endpoint,
        },
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return false;
  }
}

/**
 * Get all push subscriptions for a user
 */
export async function getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    return subscriptions.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));
  } catch (error) {
    console.error('Failed to get user subscriptions:', error);
    return [];
  }
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<boolean> {
  if (!isPushConfigured()) {
    console.warn('Push notifications not configured');
    return false;
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    );

    return true;
  } catch (error: any) {
    // Handle expired subscriptions
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log('Subscription expired, should be removed');
      return false;
    }

    console.error('Failed to send push notification:', error);
    return false;
  }
}

/**
 * Send push notification to a user (all their subscriptions)
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<number> {
  const subscriptions = await getUserSubscriptions(userId);
  let sentCount = 0;

  for (const subscription of subscriptions) {
    const success = await sendPushNotification(subscription, payload);
    if (success) sentCount++;
  }

  return sentCount;
}

/**
 * Send "going live" notification to followers
 * TODO: Implement when LiveStreamFollow model is added
 */
export async function sendGoingLiveNotification(
  _streamerId: string,
  _streamerName: string,
  _streamTitle: string,
  _streamId: string,
  _thumbnailUrl?: string
): Promise<number> {
  if (!isPushConfigured()) return 0;

  // TODO: Implement when live stream follow feature is added
  // This requires a LiveStreamFollow model that tracks which users
  // want push notifications for specific streamers
  console.log('sendGoingLiveNotification: Feature not yet implemented');
  return 0;
}

/**
 * Send meeting reminder notification
 */
export async function sendMeetingReminder(
  userId: string,
  meetingTitle: string,
  meetingCode: string,
  startsIn: string
): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: `⏰ Meeting Starting ${startsIn}`,
    body: meetingTitle,
    icon: '/icons/meeting-icon.png',
    badge: '/icons/badge-icon.png',
    tag: `meeting-${meetingCode}`,
    data: {
      type: 'meeting_reminder',
      meetingCode,
      url: `/meet/${meetingCode}`,
    },
    actions: [
      { action: 'join', title: 'Join Now', icon: '/icons/video-icon.png' },
      { action: 'snooze', title: 'Remind in 5 min' },
    ],
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
  };

  const sentCount = await sendPushToUser(userId, payload);
  return sentCount > 0;
}

/**
 * Send stream ending soon notification
 */
export async function sendStreamEndingSoonNotification(
  viewerUserId: string,
  streamerName: string,
  streamId: string
): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: `⚠️ Stream Ending Soon`,
    body: `${streamerName}'s stream is about to end`,
    icon: '/icons/live-icon.png',
    tag: `stream-ending-${streamId}`,
    data: {
      type: 'stream_ending',
      streamId,
      url: `/live/${streamId}`,
    },
    requireInteraction: false,
  };

  const sentCount = await sendPushToUser(viewerUserId, payload);
  return sentCount > 0;
}

/**
 * Generate VAPID keys (run once to set up)
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys();
}
