import { getOrgSessionFromSession } from '@cronkwaters/auth';
import { appRouter, createContext } from '@cronkwaters/trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export async function GET(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req: request,
    createContext: async () => {
      const orgSession = await getOrgSessionFromSession();
      return createContext({
        orgSession,
        headers: request.headers,
      });
    },
  });
}

export async function POST(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req: request,
    createContext: async () => {
      const orgSession = await getOrgSessionFromSession();
      return createContext({
        orgSession,
        headers: request.headers,
      });
    },
  });
}
