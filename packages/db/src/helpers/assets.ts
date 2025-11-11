import { prisma } from '../index';
import type { Asset, AssetType } from '@prisma/client';

export interface CreateAssetInput {
  projectId?: string;
  name: string;
  mimeType: string;
  bytes: bigint;
  storageKey: string;
  storageBucket?: string;
  checksum: string;
  duration?: number;
  sampleRate?: number;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
  assetType: AssetType;
}

export interface UpdateAssetInput {
  name?: string;
  projectId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Determine asset type from MIME type
 */
export function getAssetTypeFromMime(mimeType: string): AssetType {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') return 'lyric';
  if (mimeType.includes('sheet') || mimeType.includes('music')) return 'chart';
  return 'other';
}

/**
 * Sanitize metadata to remove sensitive information
 */
function sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> | null {
  if (!metadata) return null;

  const sensitiveKeys = [
    'internalPath',
    'apiKey',
    'secret',
    'password',
    'token',
    'WATERMARK_SECRET',
    'INTERNAL_KEY',
    'privateKey',
    'accessKey'
  ];

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()));
    
    if (!isSensitive) {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

/**
 * Create a new asset with validation and deduplication
 * BUG FIX: Uses transaction to prevent race conditions
 */
export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  // BUG FIX: Use transaction to prevent race conditions on concurrent uploads
  return prisma.$transaction(async (tx) => {
    // Check for existing asset by checksum first (deduplication)
    if (input.checksum) {
      const existingByChecksum = await tx.asset.findFirst({
        where: { checksum: input.checksum }
      });

      if (existingByChecksum) {
        // Return existing asset instead of creating duplicate
        return existingByChecksum;
      }
    }

    // Validate storage key uniqueness within transaction
    const existing = await tx.asset.findUnique({
      where: { storageKey: input.storageKey }
    });

    if (existing) {
      throw new Error(`Asset with storage key "${input.storageKey}" already exists`);
    }

    // If projectId provided, validate project exists
    if (input.projectId) {
      const project = await tx.project.findUnique({
        where: { id: input.projectId }
      });

      if (!project) {
        throw new Error(`Project with id "${input.projectId}" not found`);
      }
    }

    // BUG FIX: Sanitize metadata to remove sensitive information
    const sanitizedMetadata = sanitizeMetadata(input.metadata);

    return tx.asset.create({
      data: {
        ...input,
        metadata: sanitizedMetadata ? sanitizedMetadata : Prisma.DbNull
      }
    });
  });
}


/**
 * Update asset
 */
export async function updateAsset(
  assetId: string,
  input: UpdateAssetInput
): Promise<Asset> {
  const existing = await prisma.asset.findUnique({
    where: { id: assetId }
  });

  if (!existing) {
    throw new Error(`Asset with id "${assetId}" not found`);
  }

  // If projectId is being changed, validate new project exists
  if (input.projectId !== undefined && input.projectId !== null) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId }
    });

    if (!project) {
      throw new Error(`Project with id "${input.projectId}" not found`);
    }
  }

  // BUG FIX: Sanitize metadata if being updated
  const sanitizedMetadata = input.metadata 
    ? sanitizeMetadata(input.metadata as Record<string, unknown>)
    : existing.metadata;

  return prisma.asset.update({
    where: { id: assetId },
    data: {
      ...input,
      metadata: sanitizedMetadata ? sanitizedMetadata : Prisma.DbNull,
      updatedAt: new Date()
    }
  });
}

/**
 * Get asset by ID
 */
export async function getAssetById(assetId: string) {
  return prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
}

/**
 * Get asset by storage key
 */
export async function getAssetByStorageKey(storageKey: string) {
  return prisma.asset.findUnique({
    where: { storageKey }
  });
}

/**
 * Get asset by checksum
 */
export async function getAssetByChecksum(checksum: string) {
  return prisma.asset.findFirst({
    where: { checksum }
  });
}

/**
 * List assets for a project
 */
export async function listAssets(projectId: string, options?: { assetType?: AssetType }) {
  return prisma.asset.findMany({
    where: {
      projectId,
      ...(options?.assetType ? { assetType: options.assetType } : {})
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * List all assets (global)
 */
export async function listAllAssets(options?: { assetType?: AssetType; limit?: number }) {
  return prisma.asset.findMany({
    where: options?.assetType ? { assetType: options.assetType } : {},
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 100
  });
}

/**
 * Delete asset
 */
export async function deleteAsset(assetId: string): Promise<void> {
  await prisma.asset.delete({
    where: { id: assetId }
  });
}

