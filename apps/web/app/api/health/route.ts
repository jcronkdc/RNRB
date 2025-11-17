import { NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';

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
      },
      database: {
        connected: false,
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

  // Overall status
  diagnostics.status = diagnostics.checks.database.connected ? 'healthy' : 'unhealthy';

  return NextResponse.json(diagnostics, {
    status: diagnostics.status === 'healthy' ? 200 : 503
  });
}
