import { z } from 'zod';

import { protectedProcedure, router } from '../trpc';

export const organizationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.membership.findMany({
      where: { userId: ctx.viewerId! },
      include: { org: true },
      orderBy: { createdAt: 'asc' }
    });
  }),
  current: protectedProcedure.query(({ ctx }) => ctx.activeMembership),
  bySlug: protectedProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.org.findUnique({
        where: { slug: input.slug }
      });
    })
});


