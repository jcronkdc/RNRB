import { ProjectVisibility, ProjectStatus } from '@prisma/client';
import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  tagline: z.string().max(200, 'Tagline must be less than 200 characters').optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional(),
  visibility: z.nativeEnum(ProjectVisibility).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
