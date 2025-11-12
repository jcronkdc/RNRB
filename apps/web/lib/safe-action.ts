import { type z, ZodError } from 'zod';

type ActionState<T> = 
  | { data?: T; error?: never }
  | { data?: never; error: string };

export function action<TInput extends z.ZodTypeAny, TOutput>(
  schema: TInput,
  handler: (input: z.infer<TInput>) => Promise<ActionState<TOutput>>
) {
  return async (input: z.infer<TInput>): Promise<ActionState<TOutput>> => {
    try {
      // Validate input
      const validatedInput = schema.parse(input);
      
      // Call the handler with validated input
      return await handler(validatedInput);
    } catch (error) {
      if (error instanceof ZodError) {
        return { error: 'Invalid input: ' + error.errors.map(e => e.message).join(', ') };
      }
      console.error('Action error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };
}
