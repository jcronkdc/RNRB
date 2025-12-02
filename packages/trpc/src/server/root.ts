import { adminRouter } from './routers/admin';
import { healthRouter } from './routers/health';
import { marketplaceRouter } from './routers/marketplace';
import { organizationRouter } from './routers/organization';
import { usageRouter } from './routers/usage';
import { viewerRouter } from './routers/viewer';
import { mergeRouters, router } from './trpc';

export const appRouter = router({
  admin: adminRouter,
  health: healthRouter,
  marketplace: marketplaceRouter,
  organization: organizationRouter,
  viewer: viewerRouter,
  usage: usageRouter,
});

export type AppRouter = typeof appRouter;

export const appMergeRouter = mergeRouters;
