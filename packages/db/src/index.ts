import { Prisma } from '@prisma/client';

export { prisma } from './prisma';
export { Prisma };

// Re-export Prisma types for convenience
export type { Org as Organization, Membership, User, Project, Song, Asset } from '@prisma/client';
// Re-export Prisma enum types
export type { LicenseTemplate, LicenseStatus } from '@prisma/client';

// Export validation schemas (not types to avoid conflicts)
export {
  createAssetSchema,
  updateAssetSchema,
  createProjectSchema,
  updateProjectSchema,
  createSongSchema,
  updateSongSchema,
  createSplitSheetSchema,
  updateSplitSheetSchema,
  splitContributorSchema
} from './validation';

// Export helper functions (types are re-exported from helpers)
export * from './helpers/assets';
export * from './helpers/events';
export * from './helpers/licenses';
export * from './helpers/podcasts';
export * from './helpers/projects';
export * from './helpers/royalties';
export * from './helpers/songs';
export * from './helpers/splits';
export * from './helpers/utils';



