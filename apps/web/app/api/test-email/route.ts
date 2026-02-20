import { NextResponse } from 'next/server';

// DISABLED: This test route allowed unauthenticated email sending.
// Use the admin dashboard or proper support routes for email testing.

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been disabled for security.' },
    { status: 403 }
  );
}
