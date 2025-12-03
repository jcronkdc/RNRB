/**
 * SECURE INVOICE HISTORY API
 *
 * GET /api/billing/invoices - Get paginated invoice history for authenticated user
 *
 * Query params:
 *   - limit: number (default: 10, max: 100)
 *   - after: string (cursor for pagination)
 */

import { NextResponse, type NextRequest } from 'next/server';

import { requireAuth } from '@/lib/session';
import { getUserInvoices } from '@/lib/stripe-user';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 100);
    const startingAfter = searchParams.get('after') || undefined;

    // Get invoices - automatically scoped to user's customer ID
    const { invoices, hasMore } = await getUserInvoices(user.id, {
      limit,
      startingAfter,
    });

    return NextResponse.json({
      success: true,
      data: {
        invoices: invoices.map((inv) => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          amount: inv.amount,
          currency: inv.currency,
          created: inv.created.toISOString(),
          pdfUrl: inv.pdfUrl,
          hostedInvoiceUrl: inv.hostedInvoiceUrl,
        })),
        hasMore,
        // Include cursor for next page if there are more results
        nextCursor: hasMore && invoices.length > 0 ? invoices[invoices.length - 1].id : null,
      },
    });
  } catch (error) {
    console.error('Invoice history API error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
