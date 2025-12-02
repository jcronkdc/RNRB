/**
 * Newsletter Subscription API
 *
 * Handles newsletter signups from the landing page and throughout the app.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { subscribeToNewsletter } from '@/lib/email/newsletter-service';
import { handleApiError, AppError } from '@/lib/errors';
import { publicLimiter, checkRateLimit } from '@/lib/rate-limit';

const subscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  source: z.string().optional(),
  preferences: z
    .object({
      productUpdates: z.boolean().optional(),
      tips: z.boolean().optional(),
      events: z.boolean().optional(),
      community: z.boolean().optional(),
    })
    .optional(),
  frequency: z.enum(['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Rate limit: 5 signups per IP per hour
    await checkRateLimit(publicLimiter, `newsletter:${ip}`);

    // Parse and validate body
    const body = await request.json();
    const validated = subscribeSchema.parse(body);

    // Get additional context
    const userAgent = request.headers.get('user-agent') || undefined;
    const referer = request.headers.get('referer') || undefined;

    // Extract UTM params from referer if present
    let utmSource: string | undefined;
    let utmMedium: string | undefined;
    let utmCampaign: string | undefined;

    if (referer) {
      try {
        const url = new URL(referer);
        utmSource = url.searchParams.get('utm_source') || undefined;
        utmMedium = url.searchParams.get('utm_medium') || undefined;
        utmCampaign = url.searchParams.get('utm_campaign') || undefined;
      } catch {
        // Invalid URL, ignore
      }
    }

    const result = await subscribeToNewsletter({
      email: validated.email,
      firstName: validated.firstName,
      lastName: validated.lastName,
      source: validated.source || 'api',
      referrer: referer,
      utmSource,
      utmMedium,
      utmCampaign,
      preferences: validated.preferences,
      frequency: validated.frequency,
      ipAddress: ip !== 'unknown' ? ip : undefined,
      userAgent,
    });

    if (!result.success) {
      throw new AppError(result.message, 'SUBSCRIPTION_FAILED', 400);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, { route: '/api/newsletter/subscribe', method: 'POST' });
  }
}
