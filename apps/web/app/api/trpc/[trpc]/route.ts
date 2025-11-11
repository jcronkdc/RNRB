import { getOrgSession } from '@songforge/auth';
import { appRouter, createContext } from '@songforge/trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (request: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    router: appRouter,
    req: request,
    createContext: async () => {
      const session = await getOrgSession();
      return createContext({
        session,
        headers: request.headers
      });
    }
  });

export { handler as GET, handler as POST };

