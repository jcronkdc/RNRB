import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

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
        OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
      },
      database: {
        connected: false,
        error: null as string | null,
        tables: {
          users: false,
          projects: false,
          songs: false,
        },
      },
      services: {
        oauth: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
        video: !!process.env.DAILY_API_KEY,
        chat: !!process.env.ABLY_API_KEY,
        ai: !!process.env.OPENROUTER_API_KEY,
      },
    },
  };

  // Check database connection and tables
  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.checks.database.connected = true;

    // Test critical tables exist
    try {
      await prisma.user.count();
      diagnostics.checks.database.tables.users = true;
    } catch (e) {}

    try {
      await prisma.project.count();
      diagnostics.checks.database.tables.projects = true;
    } catch (e) {}

    try {
      await prisma.song.count();
      diagnostics.checks.database.tables.songs = true;
    } catch (e) {}
  } catch (error) {
    diagnostics.checks.database.connected = false;
    diagnostics.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Calculate overall health percentage
  const totalChecks = 10; // DB + OAuth + Video + Chat + AI + 3 core env vars + 3 tables
  let healthyChecks = 0;

  if (diagnostics.checks.database.connected) healthyChecks++;
  if (diagnostics.checks.database.tables.users) healthyChecks++;
  if (diagnostics.checks.database.tables.projects) healthyChecks++;
  if (diagnostics.checks.database.tables.songs) healthyChecks++;
  if (diagnostics.checks.env.DATABASE_URL) healthyChecks++;
  if (diagnostics.checks.env.NEXTAUTH_SECRET) healthyChecks++;
  if (diagnostics.checks.services.oauth) healthyChecks += 2; // OAuth counts double (critical)
  if (diagnostics.checks.services.video) healthyChecks++;
  if (diagnostics.checks.services.chat) healthyChecks++;

  const healthPercentage = Math.round((healthyChecks / totalChecks) * 100);

  // Overall status
  const tablesHealthy =
    diagnostics.checks.database.tables.users &&
    diagnostics.checks.database.tables.projects &&
    diagnostics.checks.database.tables.songs;

  diagnostics.status =
    diagnostics.checks.database.connected && diagnostics.checks.services.oauth && tablesHealthy
      ? 'healthy'
      : 'degraded';

  return NextResponse.json(
    {
      ...diagnostics,
      healthPercentage,
      summary: {
        coreInfrastructure:
          diagnostics.checks.database.connected &&
          diagnostics.checks.env.DATABASE_URL &&
          diagnostics.checks.env.NEXTAUTH_SECRET &&
          tablesHealthy,
        authentication: diagnostics.checks.services.oauth,
        collaboration: diagnostics.checks.services.video && diagnostics.checks.services.chat,
        apis: {
          projects: diagnostics.checks.database.tables.projects,
          songs: diagnostics.checks.database.tables.songs,
        },
      },
    },
    {
      status: diagnostics.status === 'healthy' ? 200 : 206, // 206 = Partial Content (degraded)
    }
  );
}
