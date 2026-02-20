import { NextResponse } from 'next/server';

// DISABLED: This endpoint exposed database schema information without authentication.

export async function GET() {
  return NextResponse.json({ error: 'This endpoint has been disabled for security.' }, { status: 403 });
}
