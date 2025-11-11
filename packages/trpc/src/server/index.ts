import { appRouter } from './root';
import { createContext, type CreateContextOptions, type Context } from './context';

export * from './context';
export * from './root';
export * from './trpc';

export const createCallerFactory = appRouter.createCallerFactory;

export async function createCaller(options: CreateContextOptions) {
  const ctx = await createContext(options);
  return appRouter.createCaller(ctx);
}

export type { Context, CreateContextOptions };

