/**
 * Live Stream Notifications
 *
 * Send notifications when artists go live
 */

import Ably from 'ably';

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Initialize Ably for server-side publishing
const ablyClient = process.env.ABLY_API_KEY
  ? new Ably.Rest({ key: process.env.ABLY_API_KEY })
  : null;

interface NotifyLiveStreamOptions {
  streamId: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar?: string;
  streamTitle: string;
  streamCategory: string;
  thumbnailUrl?: string;
}

/**
 * Notify all subscribers when an artist goes live
 */
export async function notifyArtistWentLive(options: NotifyLiveStreamOptions) {
  const {
    streamId,
    streamerId,
    streamerName,
    streamerAvatar,
    streamTitle,
    streamCategory,
    thumbnailUrl,
  } = options;

  try {
    // Get all active subscribers
    const subscribers = await db.$queryRaw<any[]>`
      SELECT 
        lns.user_id,
        lns.notify_via_push,
        lns.notify_via_email,
        u.email,
        u.name as user_name
      FROM live_notification_subscriptions lns
      JOIN "User" u ON u.id = lns.user_id
      WHERE lns.artist_id = ${streamerId}
      AND lns.is_active = true
      AND lns.notify_on_live = true
    `;

    if (subscribers.length === 0) {
      return { notifiedCount: 0 };
    }

    const streamUrl = `${process.env.NEXT_PUBLIC_APP_URL}/live/${streamId}`;

    // Send push notifications via Ably
    if (ablyClient) {
      const pushNotifications = subscribers
        .filter((s) => s.notify_via_push)
        .map((subscriber) => {
          const channel = ablyClient.channels.get(`notifications:user:${subscriber.user_id}`);
          return channel.publish('notification', {
            type: 'live_start',
            title: `🔴 ${streamerName} is now LIVE!`,
            message: streamTitle,
            fromUserId: streamerId,
            fromUserName: streamerName,
            fromUserAvatar: streamerAvatar,
            link: streamUrl,
            metadata: {
              streamId,
              category: streamCategory,
              thumbnailUrl,
            },
          });
        });

      await Promise.allSettled(pushNotifications);
    }

    // Store notifications in database
    const notificationInserts = subscribers.map((subscriber) => {
      return db.$executeRaw`
        INSERT INTO "Notification" (id, "userId", "actorId", type, title, message, link, metadata, "createdAt")
        VALUES (
          gen_random_uuid(),
          ${subscriber.user_id},
          ${streamerId},
          'live_start',
          ${`${streamerName} is now LIVE!`},
          ${streamTitle},
          ${streamUrl},
          ${JSON.stringify({ streamId, category: streamCategory, thumbnailUrl })}::jsonb,
          NOW()
        )
      `;
    });

    await Promise.allSettled(notificationInserts);

    // Send emails (batched, non-blocking)
    const emailSubscribers = subscribers.filter((s) => s.notify_via_email && s.email);
    if (emailSubscribers.length > 0) {
      // Fire and forget - don't block the response
      sendLiveEmails(emailSubscribers, {
        streamerName,
        streamTitle,
        streamUrl,
        thumbnailUrl,
        streamCategory,
      }).catch((err) => console.error('Failed to send live notification emails:', err));
    }

    return { notifiedCount: subscribers.length };
  } catch (error) {
    console.error('Failed to send live notifications:', error);
    throw error;
  }
}

async function sendLiveEmails(
  subscribers: Array<{ email: string; user_name: string }>,
  options: {
    streamerName: string;
    streamTitle: string;
    streamUrl: string;
    thumbnailUrl?: string;
    streamCategory: string;
  }
) {
  const { streamerName, streamTitle, streamUrl, thumbnailUrl, streamCategory } = options;

  for (const subscriber of subscribers) {
    try {
      await sendEmail({
        to: subscriber.email,
        subject: `🔴 ${streamerName} is now LIVE!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">
                🔴 ${streamerName} is LIVE!
              </h1>
            </div>
            
            <div style="background: #1a1a1a; padding: 30px; color: white;">
              ${
                thumbnailUrl
                  ? `
                <img src="${thumbnailUrl}" alt="${streamTitle}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;" />
              `
                  : ''
              }
              
              <h2 style="margin: 0 0 10px; font-size: 22px;">${streamTitle}</h2>
              <p style="color: #888; margin: 0 0 20px; font-size: 14px;">
                Category: ${streamCategory}
              </p>
              
              <a href="${streamUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #db2777 100%); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Watch Now →
              </a>
            </div>
            
            <div style="background: #0a0a0a; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: #666; margin: 0; font-size: 12px;">
                You're receiving this because you subscribed to live notifications from ${streamerName}.
                <br />
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications" style="color: #888;">
                  Manage preferences
                </a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error(`Failed to send email to ${subscriber.email}:`, err);
    }
  }
}

/**
 * Notify subscribers when an artist schedules a stream
 */
export async function notifyStreamScheduled(options: {
  streamId: string;
  streamerId: string;
  streamerName: string;
  streamTitle: string;
  scheduledDate: Date;
}) {
  const { streamId, streamerId, streamerName, streamTitle, scheduledDate } = options;

  try {
    const subscribers = await db.$queryRaw<any[]>`
      SELECT user_id
      FROM live_notification_subscriptions
      WHERE artist_id = ${streamerId}
      AND is_active = true
      AND notify_on_scheduled = true
    `;

    if (subscribers.length === 0 || !ablyClient) {
      return { notifiedCount: 0 };
    }

    const streamUrl = `${process.env.NEXT_PUBLIC_APP_URL}/live/${streamId}`;
    const formattedDate = scheduledDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const pushNotifications = subscribers.map((subscriber) => {
      const channel = ablyClient.channels.get(`notifications:user:${subscriber.user_id}`);
      return channel.publish('notification', {
        type: 'live_scheduled',
        title: `📅 ${streamerName} scheduled a live stream`,
        message: `"${streamTitle}" - ${formattedDate}`,
        fromUserId: streamerId,
        fromUserName: streamerName,
        link: streamUrl,
        metadata: { streamId, scheduledDate: scheduledDate.toISOString() },
      });
    });

    await Promise.allSettled(pushNotifications);

    return { notifiedCount: subscribers.length };
  } catch (error) {
    console.error('Failed to send scheduled stream notifications:', error);
    throw error;
  }
}
