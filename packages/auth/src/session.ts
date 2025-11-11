import type { Membership, Organization } from '@songforge/db';
import { prisma } from '@songforge/db';
import type { Session } from 'next-auth';
import { cookies } from 'next/headers';
import { auth } from './auth';

export interface OrgAwareSession {
  session: Session;
  memberships: Array<Membership & { organization: Organization }>;
  activeMembership: (Membership & { organization: Organization }) | null;
}

export async function getOrgSession(target?: {
  organizationId?: string;
  slug?: string;
}): Promise<OrgAwareSession | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { organization: true }
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
  memberships: Array<Membership & { organization: Organization }>,
  target?: { organizationId?: string; slug?: string }
) {
  if (!memberships.length) {
    return null;
  }

  if (target?.organizationId) {
    return memberships.find((membership) => membership.organizationId === target.organizationId) ?? null;
  }

  if (target?.slug) {
    return memberships.find((membership) => membership.organization.slug === target.slug) ?? null;
  }

  if (session.user.activeOrganizationId) {
    return (
      memberships.find((membership) => membership.organizationId === session.user.activeOrganizationId) ??
      memberships[0] ??
      null
    );
  }

  return memberships[0] ?? null;
}

/**
 * Sets the active organization cookie for the current user. Safe to use inside server actions.
 */
export function setActiveOrgCookie(orgId: string | null): void {
  const store = cookies();

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
