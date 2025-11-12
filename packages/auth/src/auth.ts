import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@cronkwater/db';
import NextAuth, { type NextAuthOptions , type Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AppleProvider from 'next-auth/providers/apple';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import nodemailer from 'nodemailer';

import { env } from './env';

function getTransporter() {
  try {
    return nodemailer.createTransport(env.EMAIL_SERVER_URL);
  } catch {
    return null;
  }
}

function getAuthConfig(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: 'jwt'
    },
    providers: [
      ...(env.EMAIL_FROM && env.EMAIL_SERVER_URL ? [
        EmailProvider({
          from: env.EMAIL_FROM,
          sendVerificationRequest: async ({ identifier, url }) => {
            const transporter = getTransporter();
            if (transporter) {
              await transporter.sendMail({
                to: identifier,
                from: env.EMAIL_FROM,
                subject: 'Sign in to CronkWater',
                text: `Sign in to CronkWater by clicking the following link: ${url}`,
                html: `<p>Sign in to CronkWater by clicking the link below:</p><p><a href="${url}">${url}</a></p>`
              });
            }
          }
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        (token as JWT & { userId?: string }).userId = user.id;
      }

      if (trigger === 'update') {
        if (session?.activeOrganizationId) {
          (token as JWT & { activeOrganizationId?: string }).activeOrganizationId = session.activeOrganizationId;
        }
      }

      const tokenWithExtras = token as JWT & { userId?: string; organizationIds?: string[]; activeOrganizationId?: string };
      
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
