import type { OrgAwareSession } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import type { Session } from 'next-auth';

export interface CreateContextOptions {
  orgSession: OrgAwareSession | null;
  headers: Headers;
}

export async function createContext({ orgSession, headers }: CreateContextOptions) {
  const session = orgSession?.session ?? null;
  const sessionUser = session?.user as { id?: string } | undefined;
  return {
    prisma,
    headers,
    session,
    orgSession,
    memberships: orgSession?.memberships ?? [],
    activeMembership: orgSession?.activeMembership ?? null,
    viewerId: sessionUser?.id ?? null
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

