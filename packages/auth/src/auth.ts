import { prisma } from '@cronkwaters/db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type NextAuthOptions , type Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AppleProvider from 'next-auth/providers/apple';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import crypto from 'crypto';

import { env } from './env';

function getAuthConfig(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: 'jwt'
    },
    providers: [
      ...(env.EMAIL_FROM && env.EMAIL_SERVER_URL ? [
        EmailProvider({
          server: env.EMAIL_SERVER_URL,
          from: env.EMAIL_FROM
        })
      ] : []),
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? ''
      }),
      AppleProvider({
        clientId: env.APPLE_CLIENT_ID ?? '',
        clientSecret: env.APPLE_CLIENT_SECRET ?? ''
      })
    ],
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      // Session fixation protection: Regenerate token ID on sign in
      if (user && account) {
        // Generate new session token ID to prevent session fixation
        token.jti = crypto.randomBytes(32).toString('hex');
        token.iat = Math.floor(Date.now() / 1000);
        (token as JWT & { userId?: string }).userId = user.id;
        
        // Store session rotation timestamp
        (token as JWT & { rotatedAt?: number }).rotatedAt = Date.now();
      }

      // Session rotation: Regenerate token periodically
      const tokenWithExtras = token as JWT & { 
        userId?: string; 
        organizationIds?: string[]; 
        activeOrganizationId?: string;
        rotatedAt?: number;
        jti?: string;
      };
      
      // Rotate session token every 60 minutes
      const ROTATION_INTERVAL = 60 * 60 * 1000; // 1 hour
      if (tokenWithExtras.rotatedAt && Date.now() - tokenWithExtras.rotatedAt > ROTATION_INTERVAL) {
        tokenWithExtras.jti = crypto.randomBytes(32).toString('hex');
        tokenWithExtras.rotatedAt = Date.now();
      }

      if (trigger === 'update') {
        if (session?.activeOrganizationId) {
          tokenWithExtras.activeOrganizationId = session.activeOrganizationId;
        }
        // Regenerate token on manual update
        tokenWithExtras.jti = crypto.randomBytes(32).toString('hex');
        tokenWithExtras.rotatedAt = Date.now();
      }
      
      if (tokenWithExtras.userId && (!tokenWithExtras.organizationIds || trigger === 'update')) {
        const memberships = await prisma.membership.findMany({
          where: { userId: tokenWithExtras.userId as string },
          include: { org: true }
        });

        tokenWithExtras.organizationIds = memberships.map((membership: { orgId: string }) => membership.orgId);
        tokenWithExtras.activeOrganizationId =
          (session?.activeOrganizationId as string | undefined) ||
          (tokenWithExtras.activeOrganizationId as string | undefined) ||
          memberships[0]?.orgId;
      }

      return tokenWithExtras;
    },
    async session({ session, token }) {
      const tokenWithExtras = token as JWT & { userId?: string; organizationIds?: string[]; activeOrganizationId?: string };
      const sessionWithExtras = session as Session & { user?: { id?: string; organizationIds?: string[]; activeOrganizationId?: string } };
      
      if (sessionWithExtras.user) {
        sessionWithExtras.user.id = tokenWithExtras.userId as string;
        sessionWithExtras.user.organizationIds = (tokenWithExtras.organizationIds as string[]) ?? [];
        sessionWithExtras.user.activeOrganizationId = tokenWithExtras.activeOrganizationId as string | undefined;
      }

      return sessionWithExtras;
    }
  }
  };
}

let _authInstance: ReturnType<typeof NextAuth> | null = null;

function getAuthInstance() {
  // Skip initialization during build time
  if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NEXTAUTH_SECRET) {
    return null;
  }
  
  if (!_authInstance) {
    try {
      _authInstance = NextAuth(getAuthConfig());
    } catch {
      // During build time or when config is invalid, return null
      return null;
    }
  }
  return _authInstance;
}

export const handlers = {
  async GET(req: Request) {
    const instance = getAuthInstance();
    if (!instance) {
      return new Response('Auth not configured', { status: 500 });
    }
    return instance.handlers.GET(req);
  },
  async POST(req: Request) {
    const instance = getAuthInstance();
    if (!instance) {
      return new Response('Auth not configured', { status: 500 });
    }
    return instance.handlers.POST(req);
  }
};

export async function auth() {
  const instance = getAuthInstance();
  if (!instance) {
    return null;
  }
  return instance.auth();
}

export async function signIn(...args: Parameters<Awaited<ReturnType<typeof NextAuth>>['signIn']>) {
  const instance = getAuthInstance();
  return instance.signIn(...args);
}

export async function signOut(...args: Parameters<Awaited<ReturnType<typeof NextAuth>>['signOut']>) {
  const instance = getAuthInstance();
  return instance.signOut(...args);
}

export const authConfig = getAuthConfig();
