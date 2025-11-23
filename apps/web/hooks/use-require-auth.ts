import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UseRequireAuthOptions {
  redirectTo?: string;
  redirectIfNoUser?: boolean;
}

interface UseRequireAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

// Cache to speed up subsequent page loads (in-memory cache)
let cachedUser: User | null | undefined = undefined;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Custom hook to require authentication on a page.
 * Handles Supabase client initialization issues and provides proper error handling.
 * Now includes caching to speed up subsequent page loads.
 *
 * @param options - Configuration options
 * @param options.redirectTo - Where to redirect if not authenticated (default: '/auth')
 * @param options.redirectIfNoUser - Whether to redirect if no user found (default: true)
 * @returns Object containing user, loading state, and error
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const { redirectTo = '/auth', redirectIfNoUser = true } = options;

  const router = useRouter();

  // Check cache first - show cached user immediately for fast initial render
  const isCacheValid = cachedUser !== undefined && Date.now() - cacheTimestamp < CACHE_DURATION;
  const [user, setUser] = useState<User | null>(isCacheValid ? cachedUser || null : null);
  const [loading, setLoading] = useState(!isCacheValid); // Don't show loading if cache is valid
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If cache is valid, still verify in background but show UI immediately
    const checkAuth = async () => {
      console.log('🔐 useRequireAuth: Starting auth check');

      // Handle case where supabase client is not initialized
      if (!supabase) {
        const err = new Error('Supabase client not initialized');
        console.error('🔐 useRequireAuth: Supabase client not initialized');
        setError(err);
        setLoading(false);

        if (redirectIfNoUser) {
          console.log('🔐 useRequireAuth: Redirecting to', redirectTo);
          router.push(redirectTo);
        }
        return;
      }

      try {
        // Use getSession first (faster - local storage check)
        console.log('🔐 useRequireAuth: Getting session from Supabase');
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('🔐 useRequireAuth: User authenticated', {
            id: session.user.id,
            email: session.user.email,
          });
          // Update cache
          cachedUser = session.user;
          cacheTimestamp = Date.now();
          setUser(session.user);
          setLoading(false);
        } else {
          console.log('🔐 useRequireAuth: No session found');
          // No session in local storage, clear cache
          cachedUser = null;
          cacheTimestamp = Date.now();

          if (redirectIfNoUser) {
            console.log('🔐 useRequireAuth: Redirecting to', redirectTo);
            router.push(redirectTo);
          }
          setLoading(false);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unexpected auth error');
        console.error('🔐 useRequireAuth: Unexpected auth error:', error);
        setError(error);

        // Clear cache on error
        cachedUser = undefined;

        if (redirectIfNoUser) {
          console.log('🔐 useRequireAuth: Redirecting to', redirectTo, 'due to error');
          router.push(redirectTo);
        }
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectTo, redirectIfNoUser]);

  return { user, loading, error };
}
