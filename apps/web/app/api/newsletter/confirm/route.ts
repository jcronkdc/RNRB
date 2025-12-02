/**
 * Newsletter Confirmation API
 *
 * Handles email confirmation tokens.
 */

import { NextRequest, NextResponse } from 'next/server';

import { confirmSubscription } from '@/lib/email/newsletter-service';
import { handleApiError, AppError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      throw new AppError('Confirmation token is required', 'INVALID_TOKEN', 400);
    }

    const result = await confirmSubscription(token);

    if (!result.success) {
      throw new AppError(result.message, 'CONFIRMATION_FAILED', 400);
    }

    // Redirect to success page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com';
    return NextResponse.redirect(`${appUrl}/newsletter/confirmed`);
  } catch (error) {
    return handleApiError(error, { route: '/api/newsletter/confirm', method: 'GET' });
  }
}
