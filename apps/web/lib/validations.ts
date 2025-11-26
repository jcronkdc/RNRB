/**
 * INPUT VALIDATION SCHEMAS
 * 
 * Zod schemas for validating API inputs.
 * All API routes should use these for request validation.
 */

import { z } from 'zod';

// ============================================
// COMMON VALIDATORS
// ============================================

/**
 * CUID validator for database IDs
 */
export const cuidSchema = z.string().regex(/^c[a-z0-9]{24}$/, 'Invalid ID format');

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Safe string - strips XSS and limits length
 */
export const safeString = (maxLength: number) =>
  z
    .string()
    .max(maxLength)
    .transform((val) =>
      val
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .replace(/[<>]/g, '') // Strip angle brackets
        .trim()
    );

/**
 * Email validator
 */
export const emailSchema = z.string().email().toLowerCase();

/**
 * Slug validator
 */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .min(1)
  .max(100);

// ============================================
// PROJECT SCHEMAS
// ============================================

export const createProjectSchema = z.object({
  name: safeString(100).pipe(z.string().min(1, 'Project name is required')),
  orgId: cuidSchema.optional(),
  description: safeString(1000).optional(),
  tagline: safeString(200).optional(),
  visibility: z.enum(['private', 'org', 'public']).default('private'),
  coverImage: z.string().url().optional().nullable(),
  genre: safeString(50).optional(),
  targetReleaseDate: z.string().datetime().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ============================================
// SETLIST SCHEMAS
// ============================================

export const energyProfileSchema = z.enum(['high', 'balanced', 'mellow']);

export const generateSetlistSchema = z.object({
  projectId: cuidSchema,
  targetDuration: z.number().int().min(5).max(300).default(90),
  energyProfile: energyProfileSchema.default('balanced'),
  requiredSongs: z.array(cuidSchema).max(50).default([]),
  excludedSongs: z.array(cuidSchema).max(100).default([]),
  openingSong: cuidSchema.optional().nullable(),
  closingSong: cuidSchema.optional().nullable(),
  avoidKeyJumps: z.boolean().default(true),
  genreBalance: z.enum(['focused', 'mixed', 'progressive']).default('mixed'),
});

// ============================================
// LIBRARY SCHEMAS
// ============================================

// Must match Prisma LibraryFileType enum
export const libraryFileTypeSchema = z.enum([
  'stem',
  'demo',
  'sample',
  'loop',
  'other',
]);

export const uploadLibraryFileSchema = z.object({
  type: libraryFileTypeSchema.default('other'),
  tags: z.array(safeString(50)).max(20).default([]),
});

// ============================================
// SONG SCHEMAS
// ============================================

export const createSongSchema = z.object({
  title: safeString(200).pipe(z.string().min(1, 'Song title is required')),
  projectId: cuidSchema,
  key: safeString(10).optional(),
  tempo: z.number().int().min(20).max(300).optional(),
  timeSignature: safeString(10).optional(),
  genre: safeString(50).optional(),
  lyrics: z.string().max(50000).optional(),
  notes: z.string().max(10000).optional(),
  duration: z.number().int().min(0).optional(),
});

export const updateSongSchema = createSongSchema.partial();

// ============================================
// ASSISTANT SCHEMAS
// ============================================

export const assistantChatSchema = z.object({
  message: safeString(10000).pipe(z.string().min(1, 'Message is required')),
  conversationId: cuidSchema.optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(50000),
      })
    )
    .max(100)
    .optional(),
});

// ============================================
// TOUR SCHEMAS
// ============================================

export const createTourSchema = z.object({
  name: safeString(200).pipe(z.string().min(1, 'Tour name is required')),
  projectId: cuidSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['planning', 'confirmed', 'in-progress', 'completed', 'cancelled']).default('planning'),
  description: safeString(2000).optional(),
});

export const updateTourSchema = createTourSchema.partial();

// ============================================
// SHOW SCHEMAS
// ============================================

export const createShowSchema = z.object({
  tourId: cuidSchema.optional(),
  venueId: cuidSchema.optional(),
  projectId: cuidSchema.optional(),
  date: z.string().datetime(),
  loadIn: z.string().optional(),
  soundcheck: z.string().optional(),
  doors: z.string().optional(),
  showTime: z.string().optional(),
  capacity: z.number().int().min(0).optional(),
  ticketPrice: z.number().min(0).optional(),
  guarantee: z.number().min(0).optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).default('pending'),
  notes: safeString(5000).optional(),
});

export const updateShowSchema = createShowSchema.partial();

// ============================================
// VENUE SCHEMAS
// ============================================

export const createVenueSchema = z.object({
  name: safeString(200).pipe(z.string().min(1, 'Venue name is required')),
  address: safeString(500).optional(),
  city: safeString(100).optional(),
  state: safeString(100).optional(),
  country: safeString(100).optional(),
  zip: safeString(20).optional(),
  capacity: z.number().int().min(0).optional(),
  contactName: safeString(100).optional(),
  contactEmail: emailSchema.optional(),
  contactPhone: safeString(30).optional(),
  notes: safeString(5000).optional(),
});

export const updateVenueSchema = createVenueSchema.partial();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse and validate request body with a Zod schema
 * Throws ZodError if validation fails (handled by error handler)
 */
export async function parseBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Parse and validate form data with a Zod schema
 */
export async function parseFormData<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const formData = await request.formData();
  const data: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    // Handle JSON fields
    if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    } else {
      data[key] = value;
    }
  });

  return schema.parse(data);
}

/**
 * Parse and validate URL search params
 */
export function parseSearchParams<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const data: Record<string, unknown> = {};

  searchParams.forEach((value, key) => {
    // Try to parse numbers and booleans
    if (value === 'true') data[key] = true;
    else if (value === 'false') data[key] = false;
    else if (/^\d+$/.test(value)) data[key] = parseInt(value, 10);
    else if (/^\d+\.\d+$/.test(value)) data[key] = parseFloat(value);
    else data[key] = value;
  });

  return schema.parse(data);
}

