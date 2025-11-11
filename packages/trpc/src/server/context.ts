import type { OrgAwareSession } from '@songforge/auth';
import { prisma } from '@songforge/db';

export interface CreateContextOptions {
  session: OrgAwareSession | null;
  headers: Headers;
}

export async function createContext({ session, headers }: CreateContextOptions) {
  const sessionUser = session?.session?.user as { id?: string } | undefined;
  return {
    prisma,
    headers,
    orgSession: session,
    memberships: session?.memberships ?? [],
    activeMembership: session?.activeMembership ?? null,
    session: session?.session ?? null,
    viewerId: sessionUser?.id ?? null
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

