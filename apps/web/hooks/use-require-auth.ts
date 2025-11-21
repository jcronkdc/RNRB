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

/**
 * Custom hook to require authentication on a page.
 * Handles Supabase client initialization issues and provides proper error handling.
 * 
 * @param options - Configuration options
 * @param options.redirectTo - Where to redirect if not authenticated (default: '/auth')
 * @param options.redirectIfNoUser - Whether to redirect if no user found (default: true)
 * @returns Object containing user, loading state, and error
 */
export function useRequireAuth(
  options: UseRequireAuthOptions = {}
): UseRequireAuthReturn {
  const {
    redirectTo = '/auth',
    redirectIfNoUser = true
  } = options;
  
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Handle case where supabase client is not initialized
      if (!supabase) {
        const err = new Error('Supabase client not initialized');
        console.error(err);
        setError(err);
        setLoading(false);
        
        if (redirectIfNoUser) {
          router.push(redirectTo);
        }
        return;
      }
      
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          setError(authError);
          
          if (redirectIfNoUser) {
            router.push(redirectTo);
          }
        } else if (!authUser) {
          if (redirectIfNoUser) {
            router.push(redirectTo);
          }
        } else {
          setUser(authUser);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unexpected auth error');
        console.error('Unexpected auth error:', error);
        setError(error);
        
        if (redirectIfNoUser) {
          router.push(redirectTo);
        }
      } finally {
        // Always set loading to false, even if there's an error
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, redirectTo, redirectIfNoUser]);

  return { user, loading, error };
}

