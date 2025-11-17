import { NextResponse } from 'next/server';
import { authConfig } from '@cronkwaters/auth';

export async function GET() {
  try {
    // Get auth configuration
    const config = authConfig;
    
    // Check environment variables
    const envCheck = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      EMAIL_SERVER_URL: !!process.env.EMAIL_SERVER_URL,
      EMAIL_FROM: process.env.EMAIL_FROM,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      DATABASE_URL: !!process.env.DATABASE_URL,
    };

    // Check provider configuration
    const providers = config.providers.map((p: any) => p.id);
    
    // Try to parse EMAIL_SERVER_URL
    let emailServerDetails = null;
    if (process.env.EMAIL_SERVER_URL) {
      try {
        const url = new URL(process.env.EMAIL_SERVER_URL);
        emailServerDetails = {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port,
          hasUsername: !!url.username,
          hasPassword: !!url.password,
          provider: url.hostname.includes('resend') ? 'resend' : 
                   url.hostname.includes('sendgrid') ? 'sendgrid' : 'smtp'
        };
      } catch (e) {
        emailServerDetails = { error: 'Invalid EMAIL_SERVER_URL format' };
      }
    }

    // Test database connection
    let dbConnection = false;
    try {
      const { prisma } = await import('@cronkwaters/db');
      await prisma.$queryRaw`SELECT 1`;
      dbConnection = true;
    } catch (e) {
      dbConnection = false;
    }

    return NextResponse.json({
      status: 'ok',
      environment: {
        ...envCheck,
        NODE_ENV: process.env.NODE_ENV
      },
      auth: {
        providers,
        sessionStrategy: config.session?.strategy,
        hasAdapter: !!config.adapter,
        emailServerDetails,
        callbackUrl: config.pages?.signIn || '/auth'
      },
      database: {
        connected: dbConnection
      },
      debug: {
        emailFrom: process.env.EMAIL_FROM || 'not set',
        fromEmail: process.env.FROM_EMAIL || 'not set',
        emailProvider: process.env.EMAIL_PROVIDER || 'not set',
        authTrustHost: process.env.AUTH_TRUST_HOST || 'not set'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
