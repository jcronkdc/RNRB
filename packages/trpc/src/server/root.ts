import { mergeRouters, router } from './trpc';
import { healthRouter } from './routers/health';
import { organizationRouter } from './routers/organization';
import { viewerRouter } from './routers/viewer';

export const appRouter = router({
  health: healthRouter,
  organization: organizationRouter,
  viewer: viewerRouter
});

export type AppRouter = typeof appRouter;

export const appMergeRouter = mergeRouters;

