import { prisma } from '@cronkwaters/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import NextAuth, { type NextAuthOptions, type Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';

import { env } from './env';

function getAuthConfig(): NextAuthOptions {
  // Log configuration status for debugging
  console.log('🔐 NextAuth Provider Configuration:', {
    hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!env.GOOGLE_CLIENT_SECRET,
    hasEmailServer: !!env.EMAIL_SERVER_URL,
    hasEmailFrom: !!env.EMAIL_FROM,
    googleClientIdPrefix: env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'not set',
    emailFrom: env.EMAIL_FROM || 'not set',
  });

  return {
    // Note: PrismaAdapter is not compatible with JWT strategy + Credentials provider
    // OAuth providers (Google, Apple) will still work without adapter when using JWT
    session: {
      strategy: 'jwt',
    },
    providers: [
      // Password-based authentication
      CredentialsProvider({
        name: 'Password',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          // Validate credentials presence
          if (!credentials?.email || !credentials?.password) {
            return null; // Invalid credentials format
          }

          try {
            // Find user by email
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            // Check if user exists and has a password set
            if (!user || !user.password) {
              return null; // Invalid credentials
            }

            // Verify password
            const isValid = await bcrypt.compare(credentials.password, user.password);

            if (!isValid) {
              return null; // Invalid credentials
            }

            // Return user object (must have id, email)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            };
          } catch (error) {
            // Only log and return null for database errors
            // This prevents exposing internal errors to the client
            console.error('Authorization error:', error);
            return null;
          }
        },
      }),
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
        if (user) {
          // Set user ID (required for all auth providers)
          (token as JWT & { userId?: string }).userId = user.id;

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
        };

        // Rotate session token every 60 minutes
        const ROTATION_INTERVAL = 60 * 60 * 1000; // 1 hour
        if (
          tokenWithExtras.rotatedAt &&
          Date.now() - tokenWithExtras.rotatedAt > ROTATION_INTERVAL
        ) {
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
        };
        const sessionWithExtras = session as Session & {
          user?: { id?: string; organizationIds?: string[]; activeOrganizationId?: string };
        };

        if (sessionWithExtras.user) {
          sessionWithExtras.user.id = tokenWithExtras.userId as string;
          sessionWithExtras.user.organizationIds =
            (tokenWithExtras.organizationIds as string[]) ?? [];
          sessionWithExtras.user.activeOrganizationId = tokenWithExtras.activeOrganizationId as
            | string
            | undefined;
        }

        return sessionWithExtras;
      },
    },
  };
}

// Export handlers and auth functions directly from NextAuth instance
// In NextAuth v4, NextAuth() returns { handlers: { GET, POST }, auth, signIn, signOut }
const authInstance = NextAuth(getAuthConfig());
export const handlers = authInstance.handlers;
export const auth = authInstance.auth;
export const signIn = authInstance.signIn;
export const signOut = authInstance.signOut;
export const authConfig = getAuthConfig();
