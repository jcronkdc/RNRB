import { NextResponse } from 'next/server';
import { prisma } from '@cronkwater/db';
import { auth } from '@cronkwater/auth';

export async function GET() {
  const diagnostics = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        EMAIL_SERVER_URL: !!process.env.EMAIL_SERVER_URL,
        EMAIL_FROM: !!process.env.EMAIL_FROM,
      },
      database: {
        connected: false,
        error: null as string | null
      },
      auth: {
        configured: false,
        error: null as string | null
      }
    }
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.checks.database.connected = true;
  } catch (error) {
    diagnostics.checks.database.connected = false;
    diagnostics.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Check auth configuration
  try {
    const session = await auth();
    diagnostics.checks.auth.configured = true;
  } catch (error) {
    diagnostics.checks.auth.configured = false;
    diagnostics.checks.auth.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Overall status
  diagnostics.status = diagnostics.checks.database.connected ? 'healthy' : 'unhealthy';

  return NextResponse.json(diagnostics, { 
    status: diagnostics.status === 'healthy' ? 200 : 503 
  });
}
