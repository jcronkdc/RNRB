/**
 * Newsletter Unsubscribe API
 *
 * Handles unsubscribe requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { unsubscribeFromNewsletter } from '@/lib/email/newsletter-service';
import { handleApiError, AppError } from '@/lib/errors';

const unsubscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = unsubscribeSchema.parse(body);

    const result = await unsubscribeFromNewsletter(validated.email, validated.reason);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, { route: '/api/newsletter/unsubscribe', method: 'POST' });
  }
}

// Also support GET with email param for one-click unsubscribe from emails
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      throw new AppError('Email is required', 'VALIDATION_ERROR', 400);
    }

    const result = await unsubscribeFromNewsletter(email);

    // Redirect to unsubscribe confirmation page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com';
    return NextResponse.redirect(`${appUrl}/newsletter/unsubscribed`);
  } catch (error) {
    return handleApiError(error, { route: '/api/newsletter/unsubscribe', method: 'GET' });
  }
}
