import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tours/[id]/financials
 *
 * DEPRECATED: Financial projections have been removed.
 * For actual accounting, use dedicated accounting software.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Financial projections have been removed',
      message:
        'This feature provided inaccurate estimates. For real financial tracking, use dedicated accounting software like QuickBooks or Wave.',
    },
    { status: 410 } // 410 Gone
  );
}
