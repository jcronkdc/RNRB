import { publicProcedure, router } from '../trpc';

export const healthRouter = router({
  check: publicProcedure.query(() => ({
    ok: true,
    timestamp: new Date().toISOString()
  }))
});


