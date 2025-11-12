import { cookies } from 'next/headers';

export { authConfig, handlers, auth, signIn, signOut } from './auth';
export { env } from './env';
export type { OrgAwareSession } from './session';
export { getOrgSession as getOrgSessionFromSession, requireOrgSession } from './session';

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
 * TODO: Replace demo bypass with real Auth.js session retrieval.
 */
export async function getServerSession(): Promise<AppSession | null> {
  if (process.env.DEMO_BYPASS === '1') {
    return {
      user: {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@example.com',
        image: null
      },
      orgId: null
    };
  }

  return null;
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
    orgId
  };

  return {
    session: normalizedSession,
    orgId,
    memberships: [],
    activeMembership: null
  };
}

/**
 * Sets the active organization cookie. Safe to invoke from server actions.
 */
export async function setActiveOrgCookie(orgId: string | null): Promise<void> {
  const store = await cookies();

  if (!orgId) {
    store.delete('sf_org');
    return;
  }

  store.set({
    name: 'sf_org',
    value: orgId,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90
  });
}
