import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@cronkwaters/db';

// Force Node.js runtime so Prisma works correctly on Vercel
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const env = process.env;

  interface DatabaseDiagnostics {
    urlHost: string | null;
    connected: boolean;
    hasUserTable: boolean;
    hasAccountTable: boolean;
    hasVerificationTokenTable: boolean;
  }

  const diagnostics: {
    auth: {
      hasNextAuthSecret: boolean;
      nextAuthUrl: string | null;
    };
    email: {
      hasEmailServerUrl: boolean;
      hasEmailFrom: boolean;
    };
    oauth: {
      hasGoogle: boolean;
      hasApple: boolean;
    };
    database: DatabaseDiagnostics;
  } = {
    auth: {
      hasNextAuthSecret: !!env.NEXTAUTH_SECRET,
      nextAuthUrl: env.NEXTAUTH_URL || null
    },
    email: {
      hasEmailServerUrl: !!env.EMAIL_SERVER_URL,
      hasEmailFrom: !!env.EMAIL_FROM
    },
    oauth: {
      hasGoogle: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET,
      hasApple: !!env.APPLE_CLIENT_ID && !!env.APPLE_CLIENT_SECRET
    },
    database: {
      urlHost: null,
      connected: false,
      hasUserTable: false,
      hasAccountTable: false,
      hasVerificationTokenTable: false
    }
  };

  try {
    const url = env.DATABASE_URL;
    if (url) {
      const hostMatch = url.match(/@([^/]+)\//);
      diagnostics.database.urlHost = hostMatch ? hostMatch[1] : null;
    }

    await prisma.$connect();
    diagnostics.database.connected = true;

    const tables = await prisma.$queryRaw<
      { table_name: string }[]
    >`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('User','Account','VerificationToken')`;

    const names = new Set(tables.map((t) => t.table_name));
    diagnostics.database.hasUserTable = names.has('User');
    diagnostics.database.hasAccountTable = names.has('Account');
    diagnostics.database.hasVerificationTokenTable = names.has('VerificationToken');
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        diagnostics,
        error: (error as Error).message
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(
    {
      ok: true,
      diagnostics
    },
    { status: 200 }
  );
}

