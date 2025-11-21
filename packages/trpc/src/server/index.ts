import { createContext, type CreateContextOptions, type Context } from './context';
import { appRouter } from './root';

export * from './context';
export * from './root';
export * from './trpc';

export async function createCaller(options: CreateContextOptions) {
  const ctx = await createContext(options);
  return appRouter.createCaller(ctx);
}

export type { Context, CreateContextOptions };




