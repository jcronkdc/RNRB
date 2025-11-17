'use client';

import Ably from 'ably/promises';
import type { RealtimePromise } from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function AblyProvider({ children }: Props) {
  const [client, setClient] = useState<RealtimePromise | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const ablyClient = new Ably.Realtime.Promise({
      authUrl: '/api/ably/token',
      authMethod: 'GET',
      clientId: process.env.NEXT_PUBLIC_ABLY_CLIENT_ID ?? 'rnrb-web',
      echoMessages: false,
      closeOnUnload: true,
      transportParams: {
        remainPresentFor: 60,
      },
    });

    setClient(ablyClient);

    return () => {
      ablyClient.close();
    };
  }, []);

  if (!client) {
    return <>{children}</>;
  }

  return <ReactAblyProvider client={client}>{children}</ReactAblyProvider>;
}

