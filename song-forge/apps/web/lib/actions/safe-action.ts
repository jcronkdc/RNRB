import type { z } from 'zod';

export function action<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput) => Promise<TOutput>
) {
  return async (input: unknown): Promise<TOutput> => {
    const validated = schema.parse(input);
    return handler(validated);
  };
}
