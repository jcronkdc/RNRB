import type { Membership, Organization } from '@songforge/db';
import { prisma } from '@songforge/db';
import { cookies } from 'next/headers';
import type { Session } from 'next-auth';


import { auth } from './auth';

export interface OrgAwareSession {
  session: Session;
  memberships: Array<Membership & { org: Organization }>;
  activeMembership: (Membership & { org: Organization }) | null;
}

export async function getOrgSession(target?: {
  organizationId?: string;
  slug?: string;
}): Promise<OrgAwareSession | null> {
  let session;
  try {
    session = await auth();
  } catch {
    // During build time or when auth is not available, return null
    return null;
  }

  if (!session?.user?.id) {
    return null;
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { org: true }
  });

  const activeMembership = resolveActiveMembership(session, memberships, target);

  return {
    session,
    memberships,
    activeMembership
  };
}

export async function requireOrgSession(target?: {
  organizationId?: string;
  slug?: string;
}): Promise<OrgAwareSession> {
  const result = await getOrgSession(target);

  if (!result) {
    throw new Error('Authentication required');
  }

  if (!result.activeMembership) {
    throw new Error('Active organization not found for user');
  }

  return result;
}

function resolveActiveMembership(
  session: Session,
  memberships: Array<Membership & { org: Organization }>,
  target?: { organizationId?: string; slug?: string }
) {
  if (!memberships.length) {
    return null;
  }

  if (target?.organizationId) {
    return memberships.find((membership) => membership.orgId === target.organizationId) ?? null;
  }

  if (target?.slug) {
    return memberships.find((membership) => membership.org.slug === target.slug) ?? null;
  }

  const userWithOrg = session.user as Session['user'] & { activeOrganizationId?: string };
  if (userWithOrg?.activeOrganizationId) {
    return (
      memberships.find((membership) => membership.orgId === userWithOrg.activeOrganizationId) ??
      memberships[0] ??
      null
    );
  }

  return memberships[0] ?? null;
}

/**
 * Sets the active organization cookie for the current user. Safe to use inside server actions.
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
