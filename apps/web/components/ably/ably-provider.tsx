'use client';

import * as Ably from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  lazy?: boolean; // New: Allow lazy initialization
}

export function AblyProvider({ children, lazy = true }: Props) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const [shouldInit, setShouldInit] = useState(!lazy);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !shouldInit) {
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
  }, [shouldInit]);

  // Lazy initialization: only connect when user interacts or after delay
  useEffect(() => {
    if (lazy && !shouldInit) {
      // Delay Ably connection until after initial render
      const timer = setTimeout(() => {
        setShouldInit(true);
      }, 2000); // Initialize after 2 seconds or user interaction

      return () => clearTimeout(timer);
    }
  }, [lazy, shouldInit]);

  // Always render children immediately - don't block app
  // This makes the app resilient and fast
  if (!client || hasError) {
    return <>{children}</>;
  }

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}

