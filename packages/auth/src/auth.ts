import { PrismaAdapter } from '@next-auth/prisma-adapter';
import nodemailer from 'nodemailer';
import NextAuth, { type NextAuthOptions } from 'next-auth';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import AppleProvider from 'next-auth/providers/apple';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from '@songforge/db';

import { env } from './env';

const transporter = nodemailer.createTransport(env.EMAIL_SERVER_URL);

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers: [
    EmailProvider({
      from: env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        await transporter.sendMail({
          to: identifier,
          from: env.EMAIL_FROM,
          subject: 'Sign in to SongForge',
          text: `Sign in to SongForge by clicking the following link: ${url}`,
          html: `<p>Sign in to SongForge by clicking the link below:</p><p><a href="${url}">${url}</a></p>`
        });
      }
    }),
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

        tokenWithExtras.organizationIds = memberships.map((membership) => membership.orgId);
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

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
