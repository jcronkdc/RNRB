import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

/**
 * @deprecated These options are no longer used. Auth protection is handled by middleware.ts
 */
interface UseRequireAuthOptions {
  /** @deprecated No longer used - middleware handles all redirects */
  redirectTo?: string;
  /** @deprecated No longer used - middleware handles all redirects */
  redirectIfNoUser?: boolean;
}

interface UseRequireAuthReturn {
  user: any | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to check authentication status on a page.
 * Uses NextAuth session for authentication.
 * 
 * ⚠️ IMPORTANT: This hook NO LONGER handles redirects or route protection.
 * 
 * Auth protection is now handled by middleware.ts at the server level.
 * This hook is ONLY for getting the current user and loading state in client components.
 * 
 * All protected routes are defined in middleware.ts. If you need a page to be:
 * - Protected: Add it to the middleware matcher
 * - Public: Remove it from the middleware matcher or add to publicRoutes array
 *
 * @param options - DEPRECATED - Options no longer have any effect
 * @returns Object containing user, loading state, and error
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const { data: session, status } = useSession();
  const [error] = useState<Error | null>(null);

  // Warn about deprecated usage
  useEffect(() => {
    if (options.redirectTo || options.redirectIfNoUser !== undefined) {
      console.warn(
        '⚠️ useRequireAuth: The options you passed (redirectTo, redirectIfNoUser) are DEPRECATED and have no effect.\n' +
        'Auth protection is now handled by middleware.ts.\n' +
        'Please remove these options from your useRequireAuth() call.\n' +
        'To change route protection, edit apps/web/middleware.ts instead.'
      );
    }
  }, []); // Only run once on mount

  useEffect(() => {
    if (status !== 'loading') {
      console.log('🔐 useRequireAuth: Session check', { 
        status, 
        hasUser: !!session?.user,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
    }
  }, [session, status]);

  return { 
    user: session?.user || null, 
    loading: status === 'loading',
    error 
  };
}
