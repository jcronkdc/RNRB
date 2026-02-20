import { NextResponse } from 'next/server';

// DISABLED: This debug endpoint allowed unauthenticated session creation (session hijacking).

export async function POST() {
  return NextResponse.json({ error: 'This endpoint has been disabled for security.' }, { status: 403 });
}

export async function GET() {
  return NextResponse.json({ error: 'This endpoint has been disabled for security.' }, { status: 403 });
}
