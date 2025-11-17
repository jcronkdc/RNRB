import { protectedProcedure, router } from '../trpc';

export const organizationRouter = router({
  // Placeholder for organization routes
  list: protectedProcedure.query(() => {
    return [];
  })
});

