import { z } from 'zod';
import { AssetType } from '@prisma/client';

const ALLOWED_AUDIO_TYPES = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/aiff', 'audio/flac', 'audio/ogg'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'text/markdown'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(500),
  mimeType: z.string().min(1),
  bytes: z.number().int().positive().max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`),
  storageKey: z.string().min(1),
  storageBucket: z.string().optional(),
  checksum: z.string().length(64, 'Checksum must be SHA-256 (64 characters)'),
  duration: z.number().positive().optional(),
  sampleRate: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  metadata: z.record(z.unknown()).optional(),
  assetType: z.nativeEnum(AssetType)
}).refine(
  (data) => {
    if (data.assetType === 'audio' && !ALLOWED_AUDIO_TYPES.includes(data.mimeType)) {
      return false;
    }
    if (data.assetType === 'image' && !ALLOWED_IMAGE_TYPES.includes(data.mimeType)) {
      return false;
    }
    if (['pdf', 'lyric'].includes(data.assetType) && !ALLOWED_DOCUMENT_TYPES.includes(data.mimeType)) {
      return false;
    }
    return true;
  },
  {
    message: 'MIME type does not match asset type',
    path: ['mimeType']
  }
);

export const updateAssetSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  projectId: z.string().cuid().nullable().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

/**
 * Get asset type from MIME type
 */
export function getAssetTypeFromMime(mimeType: string): AssetType {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/')) return 'lyric';
  return 'other';
}

