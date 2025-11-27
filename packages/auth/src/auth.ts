import { prisma } from '@cronkwaters/db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import NextAuth, { type Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Adapter } from 'next-auth/adapters';
import Credentials from 'next-auth/providers/credentials';
import Email from 'next-auth/providers/nodemailer';
import Google from 'next-auth/providers/google';

import { env } from './env';

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
        // Validate credentials presence
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          // Check if user exists and has a password set
          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isValid) {
            return null;
          }

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('Authorization error:', error);
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
    async jwt({ token, user, trigger, session, account }) {
      // Session fixation protection: Regenerate token ID on sign in
      if (user) {
        // Set user ID (required for all auth providers)
        (token as JWT & { userId?: string }).userId = user.id;

        // Check if user has completed profile (for new user redirect)
        if (user.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { profileCompleted: true },
          });
          (token as JWT & { profileCompleted?: boolean }).profileCompleted =
            dbUser?.profileCompleted ?? false;
        }

        // Generate new session token ID to prevent session fixation
        if (account) {
          token.jti = crypto.randomBytes(32).toString('hex');
          token.iat = Math.floor(Date.now() / 1000);
          // Store session rotation timestamp
          (token as JWT & { rotatedAt?: number }).rotatedAt = Date.now();
        } else {
          // For credentials provider (no account object)
          token.jti = crypto.randomBytes(32).toString('hex');
          token.iat = Math.floor(Date.now() / 1000);
          (token as JWT & { rotatedAt?: number }).rotatedAt = Date.now();
        }
      }

      // Session rotation: Regenerate token periodically
      const tokenWithExtras = token as JWT & {
        userId?: string;
        organizationIds?: string[];
        activeOrganizationId?: string;
        rotatedAt?: number;
        jti?: string;
        profileCompleted?: boolean;
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
        // Update profile completion status if changed
        if (session?.profileCompleted !== undefined) {
          tokenWithExtras.profileCompleted = session.profileCompleted;
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

        tokenWithExtras.organizationIds = memberships.map(
          (membership: { orgId: string }) => membership.orgId
        );
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
        profileCompleted?: boolean;
      };
      const sessionWithExtras = session as Session & {
        user?: {
          id?: string;
          organizationIds?: string[];
          activeOrganizationId?: string;
          profileCompleted?: boolean;
        };
      };

      if (sessionWithExtras.user) {
        sessionWithExtras.user.id = tokenWithExtras.userId as string;
        sessionWithExtras.user.organizationIds =
          (tokenWithExtras.organizationIds as string[]) ?? [];
        sessionWithExtras.user.activeOrganizationId = tokenWithExtras.activeOrganizationId as
          | string
          | undefined;
        sessionWithExtras.user.profileCompleted = tokenWithExtras.profileCompleted ?? false;
      }

      return sessionWithExtras;
    },
  },

  pages: {
    signIn: '/auth',
    error: '/auth/error',
  },
});
