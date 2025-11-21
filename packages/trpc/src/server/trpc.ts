import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    };
  }
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.viewerId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      viewerId: ctx.viewerId
    }
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);




