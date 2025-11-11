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
 * Create a new asset with validation
 */
export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  // Validate storage key uniqueness
  const existing = await prisma.asset.findUnique({
    where: { storageKey: input.storageKey }
  });

  if (existing) {
    throw new Error(`Asset with storage key "${input.storageKey}" already exists`);
  }

  // If projectId provided, validate project exists
  if (input.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: input.projectId }
    });

    if (!project) {
      throw new Error(`Project with id "${input.projectId}" not found`);
    }
  }

  return prisma.asset.create({
    data: {
      ...input,
      metadata: input.metadata ? (input.metadata as object) : null
    }
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

  return prisma.asset.update({
    where: { id: assetId },
    data: {
      ...input,
      metadata: input.metadata ? (input.metadata as object) : existing.metadata,
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

