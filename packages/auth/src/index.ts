import { cookies } from 'next/headers';

export { auth, handlers, signIn, signOut } from './auth';
export { env } from './env';
export { getOrgSession as getOrgSessionFromSession, requireOrgSession } from './session';
export type { OrgAwareSession } from './session';

// Compatibility shim for legacy authOptions pattern
export const authOptions = {};

export type AppUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type AppSession = {
  user?: AppUser | null;
  orgId?: string | null;
};

export interface OrgSession {
  session: AppSession;
  orgId: string;
  memberships: never[];
  activeMembership: null;
}

/**
 * Require authentication - throws if not authenticated
 * Returns the authenticated user with guaranteed id
 */
export async function requireAuth(): Promise<AppUser & { id: string }> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('UNAUTHENTICATED');
  }
  return session.user as AppUser & { id: string };
}

/**
 * Require authentication and return full session
 * Use this when you need access to orgId as well
 */
export async function requireAuthSession(): Promise<AppSession & { user: AppUser }> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('UNAUTHENTICATED');
  }
  return session as AppSession & { user: AppUser };
}

/**
 * Get server session using Auth.js (NextAuth).
 * This function retrieves the authenticated user session.
 */
export async function getServerSession(): Promise<AppSession | null> {
  // Import auth function dynamically to avoid build-time issues
  const { auth } = await import('./auth');
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return {
    user: {
      id: session.user.id ?? '',
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
    },
    orgId: (session.user as { activeOrganizationId?: string }).activeOrganizationId ?? null,
  };
}

export async function getOrgSession(): Promise<OrgSession> {
  const session = await getServerSession();

  if (!session) {
    throw new Error('UNAUTHENTICATED');
  }

  const cookieStore = await cookies();
  const cookieOrgId = cookieStore.get('sf_org')?.value ?? null;
  const orgId = session.orgId ?? cookieOrgId ?? null;

  if (!orgId) {
    throw new Error('NO_ACTIVE_ORG');
  }

  const normalizedSession: AppSession = {
    ...session,
    orgId,
  };

  return {
    session: normalizedSession,
    orgId,
    memberships: [],
    activeMembership: null,
  };
}

// Re-export from session.ts (single source of truth)
export { setActiveOrgCookie } from './session';
