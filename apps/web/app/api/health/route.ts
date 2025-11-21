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
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        DAILY_API_KEY: !!process.env.DAILY_API_KEY,
        ABLY_API_KEY: !!process.env.ABLY_API_KEY,
      },
      database: {
        connected: false,
        error: null as string | null
      },
      services: {
        oauth: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
        video: !!process.env.DAILY_API_KEY,
        chat: !!process.env.ABLY_API_KEY,
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

  // Calculate overall health percentage
  const totalChecks = 7; // DB + OAuth + Video + Chat + 3 core env vars
  let healthyChecks = 0;
  
  if (diagnostics.checks.database.connected) healthyChecks++;
  if (diagnostics.checks.env.DATABASE_URL) healthyChecks++;
  if (diagnostics.checks.env.NEXTAUTH_SECRET) healthyChecks++;
  if (diagnostics.checks.services.oauth) healthyChecks += 2; // OAuth counts double (critical)
  if (diagnostics.checks.services.video) healthyChecks++;
  if (diagnostics.checks.services.chat) healthyChecks++;
  
  const healthPercentage = Math.round((healthyChecks / totalChecks) * 100);

  // Overall status
  diagnostics.status = diagnostics.checks.database.connected && 
                       diagnostics.checks.services.oauth ? 'healthy' : 'degraded';

  return NextResponse.json({
    ...diagnostics,
    healthPercentage,
    summary: {
      coreInfrastructure: diagnostics.checks.database.connected && 
                          diagnostics.checks.env.DATABASE_URL && 
                          diagnostics.checks.env.NEXTAUTH_SECRET,
      authentication: diagnostics.checks.services.oauth,
      collaboration: diagnostics.checks.services.video && diagnostics.checks.services.chat,
    }
  }, {
    status: diagnostics.status === 'healthy' ? 200 : 206 // 206 = Partial Content (degraded)
  });
}

