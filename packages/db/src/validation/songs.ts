import { z } from 'zod';

export const createSongSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  key: z.string().max(10, 'Key must be less than 10 characters').optional(),
  tempo: z.number().int().min(1).max(300).optional(),
  timeSignature: z.string().regex(/^\d+\/\d+$/, 'Time signature must be in format like "4/4"').optional(),
  iswc: z.string().regex(/^T-\d{3}\.\d{3}\.\d{3}-\d$/, 'ISWC must be in format T-XXX.XXX.XXX-X').optional(),
  description: z.string().max(2000).optional(),
  lyrics: z.string().max(50000).optional()
});

export const updateSongSchema = createSongSchema.partial();

export type CreateSongInput = z.infer<typeof createSongSchema>;
export type UpdateSongInput = z.infer<typeof updateSongSchema>;

