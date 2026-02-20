import { NextResponse } from 'next/server';

// DISABLED: This test route was a security vulnerability.
// It allowed unauthenticated access to create/delete users and exposed passwords.
// Use `prisma studio` or proper admin routes for database debugging.

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been disabled for security.' },
    { status: 403 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been disabled for security.' },
    { status: 403 }
  );
}
