/**
 * Storage abstraction for S3/R2 compatible storage
 */

export interface StorageConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region?: string;
  publicUrl?: string;
}

export interface UploadOptions {
  key: string;
  contentType: string;
  contentLength: number;
  checksum?: string;
  metadata?: Record<string, string>;
}

export interface SignedUrlOptions {
  expiresIn?: number; // seconds
  download?: boolean;
  filename?: string;
}

let storageConfig: StorageConfig | null = null;

/**
 * Initialize storage configuration
 */
export function initStorage(config: StorageConfig) {
  storageConfig = config;
}

/**
 * Get storage configuration
 */
export function getStorageConfig(): StorageConfig {
  if (!storageConfig) {
    throw new Error('Storage not initialized. Call initStorage() first.');
  }
  return storageConfig;
}

/**
 * Generate a presigned URL for uploading
 * Delegates to S3 implementation
 */
export async function getUploadUrl(options: UploadOptions): Promise<{
  url: string;
  key: string;
  fields?: Record<string, string>;
}> {
  const { getUploadUrl: s3GetUploadUrl } = await import('./s3');
  return s3GetUploadUrl(options);
}

/**
 * Generate a presigned URL for downloading
 * Delegates to S3 implementation
 */
export async function getDownloadUrl(
  key: string,
  options?: SignedUrlOptions
): Promise<string> {
  const { getDownloadUrl: s3GetDownloadUrl } = await import('./s3');
  return s3GetDownloadUrl(key, options);
}

/**
 * Delete an object from storage
 * Delegates to S3 implementation
 */
export async function deleteObject(key: string): Promise<void> {
  const { deleteObject: s3DeleteObject } = await import('./s3');
  return s3DeleteObject(key);
}

/**
 * Check if object exists
 * Delegates to S3 implementation
 */
export async function objectExists(key: string): Promise<boolean> {
  const { objectExists: s3ObjectExists } = await import('./s3');
  return s3ObjectExists(key);
}

