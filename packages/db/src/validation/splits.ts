import { z } from 'zod';

export const splitContributorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  role: z.string().max(100).optional(),
  percentage: z.number().min(0).max(100),
  pro: z.string().max(50).optional(),
  ipi: z.string().max(20).optional(),
  publisher: z.string().max(200).optional(),
  email: z.string().email().optional()
});

export const createSplitSheetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  notes: z.string().max(2000).optional(),
  contributors: z.array(splitContributorSchema).min(1, 'At least one contributor is required')
}).refine(
  (data) => {
    const total = data.contributors.reduce((sum, c) => sum + c.percentage, 0);
    return Math.abs(total - 100) < 0.01;
  },
  {
    message: 'Contributors must total exactly 100%',
    path: ['contributors']
  }
);

export const updateSplitSheetSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).optional()
});

export type CreateSplitSheetInput = z.infer<typeof createSplitSheetSchema>;
export type UpdateSplitSheetInput = z.infer<typeof updateSplitSheetSchema>;
export type SplitContributorInput = z.infer<typeof splitContributorSchema>;

