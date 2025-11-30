/**
 * SESSION UTILITIES
 *
 * Standardized authentication helpers using NextAuth ONLY.
 * Do NOT use Supabase auth for authentication - use Supabase only for storage.
 *
 * Usage:
 *   import { getCurrentUser, requireAuth } from '@/lib/session';
 *
 *   // In API routes:
 *   const user = await requireAuth(); // Throws AppError if not authenticated
 *
 *   // In pages:
 *   const user = await getCurrentUser(); // Returns null if not authenticated
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { auth } from '@/auth';
import { AppError } from '@/lib/errors';

/**
 * Get current user from session (cached per request)
 * Returns null if not authenticated
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user || null;
});

/**
 * Get current user ID from session (cached per request)
 * Returns null if not authenticated
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const session = await auth();
  return session?.user?.id || null;
});

/**
 * Require authentication - throws AppError if not authenticated
 * Use this in API routes
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw AppError.unauthorized();
  }

  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.name || '',
    image: session.user.image || null,
  };
}

/**
 * Require user session - redirects to /auth if not authenticated
 * Use this in Server Components
 */
export async function requireUserSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth');
  }

  return session;
}

/**
 * Require organization session - redirects if no org selected
 * Use this in pages that require an organization context
 */
export async function requireOrgSession() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth');
  }

  const cookieStore = await cookies();
  const orgId = cookieStore.get('sf_org')?.value;

  if (!orgId) {
    redirect('/onboarding/organization');
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
    },
    organization: {
      id: orgId,
    },
  };
}

/**
 * Check if request has valid session (for middleware-like checks)
 */
export async function hasValidSession(): Promise<boolean> {
  try {
    const session = await auth();
    return !!session?.user?.id;
  } catch {
    return false;
  }
}

// ============================================
// LEGACY ALIASES (for backwards compatibility)
// Remove these after migration is complete
// ============================================

/**
 * @deprecated Use getCurrentUser() instead
 */
export const currentUser = getCurrentUser;
