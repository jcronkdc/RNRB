import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseRequireAuthOptions {
  redirectTo?: string;
  redirectIfNoUser?: boolean;
}

interface UseRequireAuthReturn {
  user: any | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to require authentication on a page.
 * Uses NextAuth session for authentication.
 *
 * @param options - Configuration options
 * @param options.redirectTo - Where to redirect if not authenticated (default: '/auth')
 * @param options.redirectIfNoUser - Whether to redirect if no user found (default: true)
 * @returns Object containing user, loading state, and error
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const { redirectTo = '/auth', redirectIfNoUser = true } = options;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    console.log('🔐 useRequireAuth: Checking NextAuth session', { status, hasUser: !!session?.user });
    
    if (status === 'loading') {
      return; // Still loading, don't redirect yet
    }

    if (status === 'unauthenticated' && redirectIfNoUser) {
      console.log('🔐 useRequireAuth: No session, redirecting to', redirectTo);
      router.push(redirectTo);
    } else if (session?.user) {
      console.log('🔐 useRequireAuth: User authenticated', {
        id: session.user.id,
        email: session.user.email,
      });
    }
  }, [session, status, router, redirectTo, redirectIfNoUser]);

  return { 
    user: session?.user || null, 
    loading: status === 'loading',
    error 
  };
}
