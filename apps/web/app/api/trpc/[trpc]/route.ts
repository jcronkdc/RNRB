import { getOrgSessionFromSession } from '@cronkwater/auth';
import { appRouter, createContext } from '@cronkwater/trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export async function GET(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req: request,
    createContext: async () => {
      const session = await getOrgSessionFromSession().catch(() => null);
      return createContext({
        session,
        headers: request.headers
      });
    }
  });
}

export async function POST(request: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req: request,
    createContext: async () => {
      const session = await getOrgSessionFromSession().catch(() => null);
      return createContext({
        session,
        headers: request.headers
      });
    }
  });
}

