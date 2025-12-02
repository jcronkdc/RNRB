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
    'mailto:support@cronkwaters.com',
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
    await db.execute(
      `
      INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh_key, auth_key, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (user_id, endpoint) 
      DO UPDATE SET 
        p256dh_key = EXCLUDED.p256dh_key,
        auth_key = EXCLUDED.auth_key,
        updated_at = NOW()
    `,
      [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );

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
    await db.execute(
      `
      DELETE FROM push_subscriptions
      WHERE user_id = $1 AND endpoint = $2
    `,
      [userId, endpoint]
    );

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
    const result = await db.execute(
      `
      SELECT endpoint, p256dh_key, auth_key
      FROM push_subscriptions
      WHERE user_id = $1
    `,
      [userId]
    );

    return result.rows.map((row: any) => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh_key,
        auth: row.auth_key,
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
 */
export async function sendGoingLiveNotification(
  streamerId: string,
  streamerName: string,
  streamTitle: string,
  streamId: string,
  thumbnailUrl?: string
): Promise<number> {
  if (!isPushConfigured()) return 0;

  try {
    // Get all followers who have push notifications enabled for this streamer
    const result = await db.execute(
      `
      SELECT DISTINCT ps.endpoint, ps.p256dh_key, ps.auth_key
      FROM push_subscriptions ps
      INNER JOIN live_stream_follows lsf ON ps.user_id = lsf.user_id
      WHERE lsf.streamer_id = $1 AND lsf.push_notifications = true
    `,
      [streamerId]
    );

    const payload: PushNotificationPayload = {
      title: `🔴 ${streamerName} is LIVE!`,
      body: streamTitle || 'Started streaming',
      icon: '/icons/live-icon.png',
      badge: '/icons/badge-icon.png',
      image: thumbnailUrl,
      tag: `live-${streamId}`,
      data: {
        type: 'live_start',
        streamId,
        streamerId,
        url: `/live/${streamId}`,
      },
      actions: [
        { action: 'watch', title: 'Watch Now', icon: '/icons/play-icon.png' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      vibrate: [200, 100, 200],
      requireInteraction: true,
    };

    let sentCount = 0;
    for (const row of result.rows as any[]) {
      const subscription: PushSubscription = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh_key,
          auth: row.auth_key,
        },
      };

      const success = await sendPushNotification(subscription, payload);
      if (success) sentCount++;
    }

    console.log(`Sent ${sentCount} going live notifications for stream ${streamId}`);
    return sentCount;
  } catch (error) {
    console.error('Failed to send going live notifications:', error);
    return 0;
  }
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
