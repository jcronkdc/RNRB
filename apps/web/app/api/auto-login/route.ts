import { NextResponse } from 'next/server';

// DISABLED: This endpoint exposed credentials in URL query parameters.

export async function GET() {
  return NextResponse.json({ error: 'This endpoint has been disabled for security.' }, { status: 403 });
}
