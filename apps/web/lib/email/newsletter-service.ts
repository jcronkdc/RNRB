/**
 * RNRB Newsletter Service
 *
 * Handles newsletter subscriptions, campaigns, and analytics using Resend.
 * This is for PLATFORM communications (product updates, tips, etc.)
 */

import { Resend } from 'resend';
import { prisma } from '@cronkwaters/db';
import crypto from 'crypto';

// Initialize Resend if API key is available
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email addresses
const NEWSLETTER_FROM =
  process.env.NEWSLETTER_FROM_EMAIL || "Rock N' Roll Basement <newsletter@rnrb.me>";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@rnrb.me';
const INFO_EMAIL = process.env.INFO_EMAIL || 'info@rnrb.me';
const NOREPLY_EMAIL = process.env.NOREPLY_EMAIL || 'noreply@rnrb.me';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com';

// Types
export interface NewsletterSubscribeParams {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  userId?: string;
  preferences?: {
    productUpdates?: boolean;
    tips?: boolean;
    events?: boolean;
    community?: boolean;
  };
  frequency?: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  ipAddress?: string;
  userAgent?: string;
}

export interface SendNewsletterParams {
  campaignId: string;
  testMode?: boolean;
  testEmails?: string[];
}

export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  pendingSubscribers: number;
  unsubscribedCount: number;
  averageOpenRate: number;
  averageClickRate: number;
  recentSubscribers: number; // Last 30 days
}

/**
 * Generate a secure confirmation token
 */
function generateConfirmToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Subscribe a new email to the newsletter
 */
export async function subscribeToNewsletter(params: NewsletterSubscribeParams): Promise<{
  success: boolean;
  message: string;
  subscriberId?: string;
  requiresConfirmation?: boolean;
}> {
  const {
    email,
    firstName,
    lastName,
    source = 'direct',
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    userId,
    preferences = { productUpdates: true, tips: true, events: true, community: false },
    frequency = 'WEEKLY',
    ipAddress,
    userAgent,
  } = params;

  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.status === 'ACTIVE') {
        return {
          success: true,
          message: "You're already subscribed to our newsletter!",
          subscriberId: existing.id,
          requiresConfirmation: false,
        };
      }

      if (existing.status === 'PENDING') {
        // Resend confirmation email
        await sendConfirmationEmail(existing.email, existing.confirmToken!);
        return {
          success: true,
          message: 'Please check your email to confirm your subscription.',
          subscriberId: existing.id,
          requiresConfirmation: true,
        };
      }

      if (existing.status === 'UNSUBSCRIBED') {
        // Re-subscribe
        const confirmToken = generateConfirmToken();
        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            status: 'PENDING',
            confirmToken,
            confirmTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            unsubscribedAt: null,
            unsubscribeReason: null,
          },
        });
        await sendConfirmationEmail(normalizedEmail, confirmToken);
        return {
          success: true,
          message: 'Welcome back! Please confirm your subscription.',
          subscriberId: existing.id,
          requiresConfirmation: true,
        };
      }
    }

    // Create new subscriber
    const confirmToken = generateConfirmToken();
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        firstName,
        lastName,
        status: 'PENDING',
        preferences,
        frequency,
        source,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        userId,
        ipAddress,
        userAgent,
        confirmToken,
        confirmTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send confirmation email
    await sendConfirmationEmail(normalizedEmail, confirmToken, firstName);

    return {
      success: true,
      message: 'Please check your email to confirm your subscription.',
      subscriberId: subscriber.id,
      requiresConfirmation: true,
    };
  } catch (error) {
    console.error('[Newsletter] Subscription error:', error);
    return {
      success: false,
      message: 'Failed to subscribe. Please try again.',
    };
  }
}

/**
 * Confirm newsletter subscription
 */
export async function confirmSubscription(token: string): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> {
  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { confirmToken: token },
    });

    if (!subscriber) {
      return {
        success: false,
        message: 'Invalid or expired confirmation link.',
      };
    }

    if (subscriber.confirmTokenExpires && subscriber.confirmTokenExpires < new Date()) {
      return {
        success: false,
        message: 'This confirmation link has expired. Please subscribe again.',
      };
    }

    if (subscriber.status === 'ACTIVE') {
      return {
        success: true,
        message: 'Your subscription is already confirmed!',
        email: subscriber.email,
      };
    }

    // Confirm the subscription
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        confirmedAt: new Date(),
        confirmToken: null,
        confirmTokenExpires: null,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(subscriber.email, subscriber.firstName);

    return {
      success: true,
      message: "You're now subscribed to our newsletter!",
      email: subscriber.email,
    };
  } catch (error) {
    console.error('[Newsletter] Confirmation error:', error);
    return {
      success: false,
      message: 'Failed to confirm subscription. Please try again.',
    };
  }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(
  email: string,
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!subscriber) {
      return {
        success: true,
        message: "You've been unsubscribed.", // Don't reveal if email exists
      };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        unsubscribeReason: reason,
      },
    });

    return {
      success: true,
      message: "You've been unsubscribed from our newsletter.",
    };
  } catch (error) {
    console.error('[Newsletter] Unsubscribe error:', error);
    return {
      success: false,
      message: 'Failed to unsubscribe. Please contact support.',
    };
  }
}

/**
 * Update subscriber preferences
 */
export async function updateSubscriberPreferences(
  email: string,
  preferences: {
    productUpdates?: boolean;
    tips?: boolean;
    events?: boolean;
    community?: boolean;
  },
  frequency?: 'REALTIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
): Promise<{ success: boolean; message: string }> {
  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!subscriber) {
      return {
        success: false,
        message: 'Subscriber not found.',
      };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        preferences,
        ...(frequency && { frequency }),
      },
    });

    return {
      success: true,
      message: 'Preferences updated successfully.',
    };
  } catch (error) {
    console.error('[Newsletter] Update preferences error:', error);
    return {
      success: false,
      message: 'Failed to update preferences.',
    };
  }
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(
  email: string,
  token: string,
  firstName?: string | null
): Promise<void> {
  if (!resend) {
    console.warn('[Newsletter] Resend not configured, skipping confirmation email');
    return;
  }

  const confirmUrl = `${APP_URL}/newsletter/confirm?token=${token}`;
  const name = firstName || 'Musician';

  await resend.emails.send({
    from: NEWSLETTER_FROM,
    to: email,
    subject: "Confirm your Rock N' Roll Basement newsletter subscription",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="${APP_URL}/logo-dark.png" alt="Rock N' Roll Basement" style="height: 60px; width: auto;">
    </div>
    
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 16px; padding: 40px;">
      <h1 style="margin: 0 0 20px; font-size: 24px; color: #C9A227;">Hey ${name}! 🎸</h1>
      
      <p style="margin: 0 0 20px; line-height: 1.6; color: #999;">
        Thanks for signing up for the Rock N' Roll Basement newsletter! We're stoked to have you join our community of musicians.
      </p>
      
      <p style="margin: 0 0 30px; line-height: 1.6; color: #999;">
        Click the button below to confirm your subscription and start receiving:
      </p>
      
      <ul style="margin: 0 0 30px; padding-left: 20px; color: #999; line-height: 1.8;">
        <li>🚀 Product updates and new features</li>
        <li>🎵 Tips & tricks for songwriting and collaboration</li>
        <li>🎤 Community events and opportunities</li>
        <li>💡 Exclusive content and early access</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #C9A227 0%, #B8941D 100%); color: #0a0a0a; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Confirm Subscription →
        </a>
      </div>
      
      <p style="margin: 30px 0 0; font-size: 12px; color: #666; text-align: center;">
        This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
      <p style="margin: 0; font-size: 12px; color: #666;">
        Rock N' Roll Basement - Where Musicians Create Together
      </p>
      <p style="margin: 10px 0 0; font-size: 12px; color: #666;">
        <a href="${APP_URL}" style="color: #C9A227; text-decoration: none;">Visit Our Site</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });
}

/**
 * Send welcome email after confirmation
 */
async function sendWelcomeEmail(email: string, firstName?: string | null): Promise<void> {
  if (!resend) {
    console.warn('[Newsletter] Resend not configured, skipping welcome email');
    return;
  }

  const name = firstName || 'Musician';

  await resend.emails.send({
    from: NEWSLETTER_FROM,
    to: email,
    subject: "Welcome to the Rock N' Roll Basement family! 🎸",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="${APP_URL}/logo-dark.png" alt="Rock N' Roll Basement" style="height: 60px; width: auto;">
    </div>
    
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 16px; padding: 40px;">
      <h1 style="margin: 0 0 20px; font-size: 28px; color: #C9A227;">You're in, ${name}! 🎉</h1>
      
      <p style="margin: 0 0 20px; line-height: 1.6; color: #999;">
        Welcome to the Rock N' Roll Basement newsletter! You're now part of a community of musicians who are serious about their craft.
      </p>
      
      <div style="background: #0d0d0d; border: 1px solid #333; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px; font-size: 16px; color: #e5e5e5;">What to expect:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #999; line-height: 1.8;">
          <li>Weekly tips and inspiration</li>
          <li>Feature announcements</li>
          <li>Community highlights</li>
          <li>Exclusive content</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #C9A227 0%, #B8941D 100%); color: #0a0a0a; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
          Start Creating →
        </a>
      </div>
      
      <p style="margin: 20px 0 0; font-size: 14px; color: #666; text-align: center;">
        Questions? Reply to this email or reach out at ${SUPPORT_EMAIL}
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
      <p style="margin: 0 0 10px; font-size: 12px; color: #666;">
        Rock N' Roll Basement - Where Musicians Create Together
      </p>
      <p style="margin: 0; font-size: 12px; color: #666;">
        <a href="${APP_URL}/newsletter/preferences?email=${encodeURIComponent(email)}" style="color: #C9A227; text-decoration: none;">Update preferences</a>
        &nbsp;|&nbsp;
        <a href="${APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #666; text-decoration: none;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  });
}

/**
 * Get newsletter statistics
 */
export async function getNewsletterStats(): Promise<NewsletterStats> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalSubscribers,
    activeSubscribers,
    pendingSubscribers,
    unsubscribedCount,
    recentSubscribers,
    engagementData,
  ] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { status: 'ACTIVE' } }),
    prisma.newsletterSubscriber.count({ where: { status: 'PENDING' } }),
    prisma.newsletterSubscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
    prisma.newsletterSubscriber.count({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.newsletterSubscriber.aggregate({
      where: { status: 'ACTIVE' },
      _avg: {
        emailsOpened: true,
        emailsClicked: true,
        emailsSent: true,
      },
    }),
  ]);

  // Calculate rates
  const avgSent = engagementData._avg.emailsSent || 1;
  const avgOpened = engagementData._avg.emailsOpened || 0;
  const avgClicked = engagementData._avg.emailsClicked || 0;

  return {
    totalSubscribers,
    activeSubscribers,
    pendingSubscribers,
    unsubscribedCount,
    averageOpenRate: avgSent > 0 ? (avgOpened / avgSent) * 100 : 0,
    averageClickRate: avgOpened > 0 ? (avgClicked / avgOpened) * 100 : 0,
    recentSubscribers,
  };
}

/**
 * Get list of active subscribers for a campaign
 */
export async function getActiveSubscribers(options?: {
  frequency?: string[];
  preferences?: Record<string, boolean>;
  limit?: number;
  offset?: number;
}): Promise<{
  subscribers: Array<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    preferences: any;
    frequency: string;
  }>;
  total: number;
}> {
  const where: any = {
    status: 'ACTIVE',
  };

  if (options?.frequency?.length) {
    where.frequency = { in: options.frequency };
  }

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        preferences: true,
        frequency: true,
      },
      take: options?.limit || 100,
      skip: options?.offset || 0,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return { subscribers, total };
}

/**
 * Track email open
 */
export async function trackEmailOpen(subscriberId: string, campaignId?: string): Promise<void> {
  await prisma.newsletterSubscriber.update({
    where: { id: subscriberId },
    data: {
      emailsOpened: { increment: 1 },
      lastOpenedAt: new Date(),
    },
  });

  if (campaignId) {
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        openCount: { increment: 1 },
      },
    });
  }
}

/**
 * Track email click
 */
export async function trackEmailClick(subscriberId: string, campaignId?: string): Promise<void> {
  await prisma.newsletterSubscriber.update({
    where: { id: subscriberId },
    data: {
      emailsClicked: { increment: 1 },
      lastClickedAt: new Date(),
    },
  });

  if (campaignId) {
    await prisma.newsletterCampaign.update({
      where: { id: campaignId },
      data: {
        clickCount: { increment: 1 },
      },
    });
  }
}

// Export email addresses for use elsewhere
export const BUSINESS_EMAILS = {
  newsletter: NEWSLETTER_FROM,
  support: SUPPORT_EMAIL,
  info: INFO_EMAIL,
  noreply: NOREPLY_EMAIL,
} as const;
