'use client';

import * as Ably from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useEffect, useState, type ReactNode } from 'react';
import { createBrowserClient } from '@/lib/supabase';

interface Props {
  children: ReactNode;
  lazy?: boolean; // New: Allow lazy initialization
}

export function AblyProvider({ children, lazy = true }: Props) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const [shouldInit, setShouldInit] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status before initializing Ably
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.warn('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Only initialize if authenticated and shouldInit is true
    if (typeof window === 'undefined' || !shouldInit || !isAuthenticated) {
      return;
    }

    try {
      const ablyClient = new Ably.Realtime({
        authUrl: '/api/ably/token',
        authMethod: 'GET',
        clientId: process.env.NEXT_PUBLIC_ABLY_CLIENT_ID ?? 'rnrb-web',
        echoMessages: false,
        closeOnUnload: true,
        transportParams: {
          remainPresentFor: 60,
        },
      });

      // Handle connection errors gracefully
      ablyClient.connection.on('failed', () => {
        console.warn('Ably connection failed - real-time features disabled');
        setHasError(true);
      });

      ablyClient.connection.on('disconnected', () => {
        console.warn('Ably disconnected - attempting reconnect...');
      });

      ablyClient.connection.on('connected', () => {
        setHasError(false);
      });

      setClient(ablyClient);

      return () => {
        ablyClient.close();
      };
    } catch (error) {
      console.warn('Ably client initialization failed:', error);
      setHasError(true);
      // App continues without real-time features
      return undefined;
    }
  }, [shouldInit, isAuthenticated]);

  // Lazy initialization: only connect when user interacts or after delay
  useEffect(() => {
    if (lazy && !shouldInit && isAuthenticated) {
      // Delay Ably connection until after initial render (only if authenticated)
      const timer = setTimeout(() => {
        setShouldInit(true);
      }, 2000); // Initialize after 2 seconds or user interaction

      return () => clearTimeout(timer);
    }
  }, [lazy, shouldInit, isAuthenticated]);

  // Always render children immediately - don't block app
  // This makes the app resilient and fast
  if (!client || hasError) {
    return <>{children}</>;
  }

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}

