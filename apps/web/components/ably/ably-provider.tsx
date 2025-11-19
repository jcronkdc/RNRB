'use client';

import Ably from 'ably';
import type { RealtimePromise } from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AblyProvider({ children }: Props) {
  const [client, setClient] = useState<RealtimePromise | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Set ready immediately so UI isn't blocked
    setIsReady(true);

    const ablyClient = new Ably.Realtime({
      authUrl: '/api/ably/token',
      authMethod: 'GET',
      clientId: process.env.NEXT_PUBLIC_ABLY_CLIENT_ID ?? 'rnrb-web',
      echoMessages: false,
      closeOnUnload: true,
      transportParams: {
        remainPresentFor: 60,
      },
    }) as RealtimePromise;

    setClient(ablyClient);

    return () => {
      ablyClient.close();
    };
  }, []);

  // Always render children, don't block on client initialization
  if (!isReady || !client) {
    return <>{children}</>;
  }

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}

