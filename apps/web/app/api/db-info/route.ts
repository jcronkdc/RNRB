import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';

  // Extract host and database name without exposing credentials
  const urlMatch = dbUrl.match(/@([^/]+)\/([^?]+)/);
  const host = urlMatch ? urlMatch[1] : 'unknown';
  const database = urlMatch ? urlMatch[2] : 'unknown';

  return NextResponse.json({
    host: host.substring(0, 30) + '...',
    database,
    hasPassword: dbUrl.includes('password') || dbUrl.includes('npg_'),
    urlLength: dbUrl.length,
  });
}
