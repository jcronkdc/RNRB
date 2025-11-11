import type { OrgAwareSession } from '@songforge/auth';
import { prisma } from '@songforge/db';

export interface CreateContextOptions {
  session: OrgAwareSession | null;
  headers: Headers;
}

export async function createContext({ session, headers }: CreateContextOptions) {
  return {
    prisma,
    headers,
    orgSession: session,
    memberships: session?.memberships ?? [],
    activeMembership: session?.activeMembership ?? null,
    session: session?.session ?? null,
    viewerId: session?.session.user.id ?? null
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

