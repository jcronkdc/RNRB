import { prisma } from '@cronkwaters/db';
import { protectedProcedure, router } from '../trpc';

export const viewerRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user) {
      return null;
    }

    // Fetch full user data including isOwner from database
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isOwner: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        profileCompleted: true,
        mlcMember: true,
        soundExchangeRegistered: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      memberships: ctx.memberships,
      activeMembership: ctx.activeMembership,
    };
  }),
});
