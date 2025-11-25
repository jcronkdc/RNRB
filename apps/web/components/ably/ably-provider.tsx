'use client';

import * as Ably from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  lazy?: boolean; // New: Allow lazy initialization
}

export function AblyProvider({ children, lazy = true }: Props) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const [shouldInit, setShouldInit] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  
  // Use NextAuth session instead of Supabase
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && !!session?.user;

  useEffect(() => {
    // Only initialize if authenticated and shouldInit is true
    if (typeof window === 'undefined' || !shouldInit || !isAuthenticated || !session?.user?.id) {
      return;
    }

    // Add connection timeout to prevent infinite "Connecting..."
    const connectionTimeout = setTimeout(() => {
      console.warn('Ably connection timeout - continuing without real-time features');
      setHasError(true);
    }, 15000); // 15 second timeout

    try {
      const ablyClient = new Ably.Realtime({
        authUrl: '/api/ably/token',
        authMethod: 'GET',
        clientId: session.user.id, // Use actual user ID to match token
        echoMessages: false,
        closeOnUnload: true,
        transportParams: {
          remainPresentFor: 60,
        },
      });

      // Handle connection success - clear timeout
      ablyClient.connection.on('connected', () => {
        clearTimeout(connectionTimeout);
        setHasError(false);
      });

      // Handle connection errors gracefully
      ablyClient.connection.on('failed', () => {
        clearTimeout(connectionTimeout);
        console.warn('Ably connection failed - real-time features disabled');
        setHasError(true);
      });

      ablyClient.connection.on('disconnected', () => {
        console.warn('Ably disconnected - attempting reconnect...');
      });

      setClient(ablyClient);

      return () => {
        clearTimeout(connectionTimeout);
        ablyClient.close();
      };
    } catch (error) {
      clearTimeout(connectionTimeout);
      console.warn('Ably client initialization failed:', error);
      setHasError(true);
      // App continues without real-time features
      return undefined;
    }
  }, [shouldInit, isAuthenticated, session?.user?.id]);

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
