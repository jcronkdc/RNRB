import type { Membership, Organization } from '@cronkwaters/db';
import { prisma } from '@cronkwaters/db';
import { cookies } from 'next/headers';
import type { Session } from 'next-auth';
import crypto from 'crypto';

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
    include: { org: true },
  });

  const activeMembership = resolveActiveMembership(session, memberships, target);

  return {
    session,
    memberships,
    activeMembership,
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
    maxAge: 60 * 60 * 24 * 90,
  });
}

// Session management enhancements

// Track active sessions per user (in-memory for now, use Redis in production)
const activeSessions = new Map<string, Set<string>>();
const MAX_CONCURRENT_SESSIONS = 3;

// Session timeout configuration
const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Track active session for a user
 */
export function trackUserSession(userId: string, sessionId: string): void {
  if (!activeSessions.has(userId)) {
    activeSessions.set(userId, new Set());
  }

  const userSessions = activeSessions.get(userId)!;
  userSessions.add(sessionId);

  // Enforce concurrent session limit
  if (userSessions.size > MAX_CONCURRENT_SESSIONS) {
    const sessionsArray = Array.from(userSessions);
    // Remove oldest sessions
    for (let i = 0; i < sessionsArray.length - MAX_CONCURRENT_SESSIONS; i++) {
      userSessions.delete(sessionsArray[i]);
    }
  }
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  activeSessions.delete(userId);

  // In production: Also invalidate sessions in database/Redis
  // await redis.del(`sessions:${userId}:*`);
}

/**
 * Check if session has been idle too long
 */
export function isSessionIdle(lastActivity: Date): boolean {
  const now = Date.now();
  const lastActivityTime = lastActivity.getTime();
  return now - lastActivityTime > SESSION_IDLE_TIMEOUT;
}

/**
 * Check if session has exceeded absolute timeout
 */
export function isSessionExpired(sessionStart: Date): boolean {
  const now = Date.now();
  const startTime = sessionStart.getTime();
  return now - startTime > SESSION_ABSOLUTE_TIMEOUT;
}

/**
 * Generate secure session fingerprint
 */
export function generateSessionFingerprint(userAgent: string, ip: string): string {
  const data = `${userAgent}:${ip}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Validate session fingerprint to detect session hijacking
 */
export function validateSessionFingerprint(
  storedFingerprint: string,
  currentUserAgent: string,
  currentIp: string
): boolean {
  const currentFingerprint = generateSessionFingerprint(currentUserAgent, currentIp);
  return crypto.timingSafeEqual(Buffer.from(storedFingerprint), Buffer.from(currentFingerprint));
}

// Cleanup expired sessions periodically (server-side only)
if (typeof window === 'undefined') {
  setInterval(
    () => {
      // Cleanup inactive sessions
      for (const [userId, sessions] of activeSessions.entries()) {
        if (sessions.size === 0) {
          activeSessions.delete(userId);
        }
      }
    },
    5 * 60 * 1000
  ); // Every 5 minutes
}
