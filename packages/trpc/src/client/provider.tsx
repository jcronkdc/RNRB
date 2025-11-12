'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import React, { useState } from 'react';
import type { ReactNode } from 'react';
import superjson from 'superjson';

import { trpc } from './react';
import { getBaseUrl } from './utils';

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error)
      }),
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson
      })
    ]
  });
}

export interface TrpcProviderProps {
  children: ReactNode;
}

export function TrpcProvider({ children }: TrpcProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [client] = useState(() => createTrpcClient());

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

