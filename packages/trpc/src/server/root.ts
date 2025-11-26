import { healthRouter } from './routers/health';
import { organizationRouter } from './routers/organization';
import { usageRouter } from './routers/usage';
import { viewerRouter } from './routers/viewer';
import { mergeRouters, router } from './trpc';

export const appRouter = router({
  health: healthRouter,
  organization: organizationRouter,
  viewer: viewerRouter,
  usage: usageRouter,
});

export type AppRouter = typeof appRouter;

export const appMergeRouter = mergeRouters;
