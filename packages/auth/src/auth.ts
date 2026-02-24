import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Email from 'next-auth/providers/nodemailer';

import { env } from './env';

const OWNER_EMAIL = 'justincronk@pm.me';

// NextAuth v5 configuration
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use Prisma adapter (compatible with JWT + Credentials in v5)
  adapter: PrismaAdapter(prisma) as Adapter,

  // Trust host for Vercel deployments (REQUIRED for v5!)
  trustHost: true,

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Cookie configuration for session persistence
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  providers: [
    // Password-based authentication
    Credentials({
      name: 'Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Normalize email to match register route
          const email = (credentials.email as string).trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: { email },
          });

          // User must exist and have a password (OAuth-only users can't use credentials)
          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error(
            '[AUTH] Authorization error:',
            error instanceof Error ? error.message : error
          );
          return null;
        }
      },
    }),

    // Email magic link provider (if configured)
    ...(env.EMAIL_FROM && env.EMAIL_SERVER_URL
      ? [
          Email({
            server: env.EMAIL_SERVER_URL,
            from: env.EMAIL_FROM,
          }),
        ]
      : []),

    // Google OAuth provider (if configured)
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) return true;

      const email = user.email.trim().toLowerCase();

      try {
        // Auto-provision isOwner for the platform owner on every sign-in
        if (email === OWNER_EMAIL) {
          await prisma.user.updateMany({
            where: { email },
            data: { isOwner: true },
          });
        }

        // For OAuth providers, ensure the user record has subscriptionTier set
        if (account?.provider !== 'credentials') {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { subscriptionTier: true, subscriptionStatus: true },
          });
          if (dbUser && !dbUser.subscriptionStatus) {
            await prisma.user.update({
              where: { email },
              data: { subscriptionTier: 'free', subscriptionStatus: 'active' },
            });
          }
        }
      } catch (error) {
        console.error(
          '[AUTH] signIn callback error:',
          error instanceof Error ? error.message : error
        );
      }

      return true;
    },

    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.userId = user.id;

        if (user.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { profileCompleted: true },
            });
            token.profileCompleted = dbUser?.profileCompleted ?? false;
          } catch (error) {
            console.error(
              '[AUTH] Failed to check profile completion:',
              error instanceof Error ? error.message : error
            );
            token.profileCompleted = false;
          }
        }

        // Session fixation protection: regenerate token ID on sign-in
        token.jti = crypto.randomBytes(32).toString('hex');
        token.iat = Math.floor(Date.now() / 1000);
        token.rotatedAt = Date.now();
      }

      // Rotate session token every 60 minutes
      const ROTATION_INTERVAL = 60 * 60 * 1000;
      if (token.rotatedAt && Date.now() - (token.rotatedAt as number) > ROTATION_INTERVAL) {
        token.jti = crypto.randomBytes(32).toString('hex');
        token.rotatedAt = Date.now();
      }

      if (trigger === 'update') {
        if (session?.activeOrganizationId) {
          token.activeOrganizationId = session.activeOrganizationId;
        }
        if (session?.profileCompleted !== undefined) {
          token.profileCompleted = session.profileCompleted;
        }
        token.jti = crypto.randomBytes(32).toString('hex');
        token.rotatedAt = Date.now();
      }

      if (token.userId && (!token.organizationIds || trigger === 'update')) {
        try {
          const memberships = await prisma.membership.findMany({
            where: { userId: token.userId },
            include: { org: true },
          });

          token.organizationIds = memberships.map(
            (membership: { orgId: string }) => membership.orgId
          );
          token.activeOrganizationId =
            (session?.activeOrganizationId as string | undefined) ||
            token.activeOrganizationId ||
            memberships[0]?.orgId;
        } catch (error) {
          console.error(
            '[AUTH] Failed to fetch memberships:',
            error instanceof Error ? error.message : error
          );
          token.organizationIds = token.organizationIds || [];
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const user = session.user as unknown as Record<string, unknown>;
        user.id = token.userId as string;
        user.organizationIds = token.organizationIds ?? [];
        user.activeOrganizationId = token.activeOrganizationId;
        user.profileCompleted = token.profileCompleted ?? false;
      }

      return session;
    },
  },

  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
});
