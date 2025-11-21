'use client';

import * as Ably from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AblyProvider({ children }: Props) {
  const [client, setClient] = useState<Ably.Realtime | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Set ready immediately so UI isn't blocked
    setIsReady(true);

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
  }, []);

  // Always render children - don't block app if Ably fails
  // This makes the app resilient to real-time service failures
  if (!isReady || !client || hasError) {
    return <>{children}</>;
  }

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}

