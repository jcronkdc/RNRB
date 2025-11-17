import { prisma } from '@cronkwaters/db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { type NextAuthConfig, type Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AppleProvider from 'next-auth/providers/apple';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import crypto from 'crypto';

import { env } from './env';

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    ...(env.EMAIL_FROM && env.EMAIL_SERVER_URL
      ? [
          EmailProvider({
            server: env.EMAIL_SERVER_URL,
            from: env.EMAIL_FROM,
          }),
        ]
      : []),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
      ? [
          AppleProvider({
            clientId: env.APPLE_CLIENT_ID,
            clientSecret: env.APPLE_CLIENT_SECRET,
          }),
        ]
      : []),
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
          include: { org: true },
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
      const tokenWithExtras = token as JWT & {
        userId?: string;
        organizationIds?: string[];
        activeOrganizationId?: string;
      };
      const sessionWithExtras = session as Session & {
        user?: { id?: string; organizationIds?: string[]; activeOrganizationId?: string };
      };

      if (sessionWithExtras.user) {
        sessionWithExtras.user.id = tokenWithExtras.userId as string;
        sessionWithExtras.user.organizationIds = (tokenWithExtras.organizationIds as string[]) ?? [];
        sessionWithExtras.user.activeOrganizationId = tokenWithExtras.activeOrganizationId as string | undefined;
      }

      return sessionWithExtras;
    },
  },
  // Surface internal Auth.js/NextAuth errors to logs so we can see exact causes in Vercel
  events: {
    async error(error) {
      console.error('[auth] NextAuth error', {
        name: (error as Error).name,
        message: (error as Error).message,
      });
    },
  },
} satisfies NextAuthConfig;

// Canonical Auth.js helpers for App Router (auth, signIn, signOut, handlers)
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

