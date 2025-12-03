/**
 * SECURE BILLING API
 *
 * This route demonstrates the CORRECT way to expose Stripe data to users.
 * All queries are automatically scoped to the authenticated user's customer ID.
 *
 * ✅ SAFE: Users can only see their own data
 * ❌ DANGEROUS: Raw Stripe queries without user scoping
 *
 * GET /api/billing - Get user's billing overview
 * POST /api/billing/portal - Create billing portal session
 * POST /api/billing/checkout - Create checkout session for upgrade
 */

import { NextResponse, type NextRequest } from 'next/server';

import { requireAuth } from '@/lib/session';
import {
  getUserSubscription,
  getUserInvoices,
  getUserPaymentMethods,
  createBillingPortalSession,
  createCheckoutSession,
} from '@/lib/stripe-user';

export const runtime = 'nodejs';

/**
 * GET /api/billing
 *
 * Returns the authenticated user's billing overview.
 * Automatically scoped - users can ONLY see their own data.
 */
export async function GET(request: NextRequest) {
  try {
    // CRITICAL: Require authentication first
    const user = await requireAuth();

    // All these functions internally scope to the user's stripeCustomerId
    const [subscription, invoicesResult, paymentMethods] = await Promise.all([
      getUserSubscription(user.id),
      getUserInvoices(user.id, { limit: 5 }),
      getUserPaymentMethods(user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          tier: subscription.tier,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        },
        recentInvoices: invoicesResult.invoices.map((inv) => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          amount: inv.amount,
          currency: inv.currency,
          created: inv.created.toISOString(),
          pdfUrl: inv.pdfUrl,
        })),
        paymentMethods: paymentMethods.map((pm) => ({
          id: pm.id,
          brand: pm.brand,
          last4: pm.last4,
          expiry: pm.expMonth && pm.expYear ? `${pm.expMonth}/${pm.expYear}` : null,
          isDefault: pm.isDefault,
        })),
      },
    });
  } catch (error) {
    console.error('Billing API error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/billing
 *
 * Handle billing actions (portal, checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { action, priceId } = body;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.rnrb.app';

    switch (action) {
      case 'portal': {
        // Create a secure billing portal session for the user
        const { url } = await createBillingPortalSession(user.id, `${baseUrl}/settings/billing`);

        return NextResponse.json({
          success: true,
          data: { url },
        });
      }

      case 'checkout': {
        // Validate price ID
        const validPriceIds = [
          process.env.STRIPE_PRICE_ID_CREATOR,
          process.env.STRIPE_PRICE_ID_STUDIO,
        ].filter(Boolean);

        if (!priceId || !validPriceIds.includes(priceId)) {
          return NextResponse.json(
            { success: false, error: 'Invalid subscription plan' },
            { status: 400 }
          );
        }

        const { url } = await createCheckoutSession(
          user.id,
          priceId,
          `${baseUrl}/settings/billing?success=true`,
          `${baseUrl}/settings/billing?canceled=true`
        );

        return NextResponse.json({
          success: true,
          data: { url },
        });
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Billing action error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process billing action' },
      { status: 500 }
    );
  }
}
