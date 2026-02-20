import { NextResponse } from 'next/server';

// DISABLED: This debug endpoint exposed session and subscription details.

export async function GET() {
  return NextResponse.json({ error: 'This endpoint has been disabled for security.' }, { status: 403 });
}
