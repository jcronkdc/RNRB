import NextAuth, { type NextAuthConfig } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import { PrismaAdapter } from '@auth/prisma-adapter';
import nodemailer from 'nodemailer';
import { prisma } from '@songforge/db';
import { env } from './env';

const transporter = nodemailer.createTransport(env.EMAIL_SERVER_URL);

export const authConfig: NextAuthConfig = {
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
        token.userId = user.id;
      }

      if (trigger === 'update') {
        if (session?.activeOrganizationId) {
          token.activeOrganizationId = session.activeOrganizationId;
        }
      }

      if (token.userId && (!token.organizationIds || trigger === 'update')) {
        const memberships = await prisma.membership.findMany({
          where: { userId: token.userId as string },
          include: { organization: true }
        });

        token.organizationIds = memberships.map((membership) => membership.organizationId);
        token.activeOrganizationId =
          (session?.activeOrganizationId as string | undefined) ||
          (token.activeOrganizationId as string | undefined) ||
          memberships[0]?.organizationId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.organizationIds = (token.organizationIds as string[]) ?? [];
        session.user.activeOrganizationId = token.activeOrganizationId as string | undefined;
      }

      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
