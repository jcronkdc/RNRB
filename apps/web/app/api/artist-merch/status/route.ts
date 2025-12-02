import { auth } from '@cronkwaters/auth';
import { type NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout, TIMEOUTS } from '@/lib/fetch-utils';

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

/**
 * Artist Merch Status API
 *
 * Checks if all required services are configured:
 * - Printful API key
 * - Printful store
 * - Stripe keys
 */

interface StatusCheck {
  name: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
  action?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checks: StatusCheck[] = [];

    // Check Printful API key
    if (!PRINTFUL_API_KEY) {
      checks.push({
        name: 'Printful API',
        status: 'error',
        message: 'PRINTFUL_API_KEY not configured',
        action: 'Add PRINTFUL_API_KEY to environment variables',
      });
    } else {
      // Check if Printful store exists
      try {
        const storeResponse = await fetchWithTimeout(
          `${PRINTFUL_API_URL}/stores`,
          {
            headers: {
              Authorization: `Bearer ${PRINTFUL_API_KEY}`,
            },
          },
          TIMEOUTS.STANDARD
        );
        const storeData = await storeResponse.json();

        if (storeData.code === 200 && storeData.result?.length > 0) {
          checks.push({
            name: 'Printful API',
            status: 'ok',
            message: `Connected to store: ${storeData.result[0].name}`,
          });
        } else if (storeData.code === 200 && storeData.result?.length === 0) {
          checks.push({
            name: 'Printful API',
            status: 'error',
            message: 'API key valid but no store created',
            action: 'Create a store at printful.com/dashboard/store/add',
          });
        } else {
          checks.push({
            name: 'Printful API',
            status: 'error',
            message: 'API key may be invalid',
            action: 'Verify PRINTFUL_API_KEY in environment variables',
          });
        }
      } catch (err) {
        checks.push({
          name: 'Printful API',
          status: 'error',
          message: 'Failed to connect to Printful',
          action: 'Check network connection and API key',
        });
      }
    }

    // Check Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      checks.push({
        name: 'Stripe Payments',
        status: 'error',
        message: 'STRIPE_SECRET_KEY not configured',
        action: 'Add STRIPE_SECRET_KEY to environment variables',
      });
    } else {
      checks.push({
        name: 'Stripe Payments',
        status: 'ok',
        message: 'Stripe configured',
      });
    }

    // Check Stripe webhook
    if (!process.env.STRIPE_MERCH_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET) {
      checks.push({
        name: 'Stripe Webhook',
        status: 'warning',
        message: 'Webhook secret not configured',
        action: 'Add STRIPE_MERCH_WEBHOOK_SECRET for order processing',
      });
    } else {
      checks.push({
        name: 'Stripe Webhook',
        status: 'ok',
        message: 'Webhook configured',
      });
    }

    // Check Supabase storage
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      checks.push({
        name: 'Image Storage',
        status: 'error',
        message: 'SUPABASE_SERVICE_ROLE_KEY not configured',
        action: 'Add SUPABASE_SERVICE_ROLE_KEY for design uploads',
      });
    } else {
      checks.push({
        name: 'Image Storage',
        status: 'ok',
        message: 'Supabase storage configured',
      });
    }

    const allOk = checks.every((c) => c.status === 'ok');
    const hasErrors = checks.some((c) => c.status === 'error');

    return NextResponse.json({
      ready: allOk,
      hasErrors,
      checks,
      summary: allOk
        ? 'All systems ready! You can create and sell merch.'
        : hasErrors
          ? 'Some required services need configuration.'
          : 'System mostly ready with minor warnings.',
    });
  } catch (error) {
    console.error('[MERCH-STATUS] Error:', error);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}
