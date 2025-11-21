import { protectedProcedure, router } from '../trpc';

export const viewerRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session?.user) {
      return null;
    }

    return {
      user: ctx.session.user,
      memberships: ctx.memberships,
      activeMembership: ctx.activeMembership
    };
  })
});


