/**
 * S3/R2 storage implementation using AWS SDK v3
 * Works with both AWS S3 and Cloudflare R2
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { StorageConfig, UploadOptions, SignedUrlOptions } from './index';
import { getEnv } from '../env';
import { sanitizeFileName } from '../sanitization';
import { SecurityLogger, detectAttackPatterns } from '../security-logging';

let s3Client: S3Client | null = null;

/**
 * Validate and sanitize S3 key to prevent directory traversal
 */
function validateS3Key(key: string, ip?: string): string {
  // Check for attack patterns
  const attacks = detectAttackPatterns(key);
  if (attacks.isPathTraversal) {
    SecurityLogger.logPathTraversalAttempt('/storage', key, ip);
    throw new Error('Invalid file path');
  }
  
  // Remove any path traversal attempts
  if (key.includes('..') || key.includes('//') || key.includes('\\')) {
    SecurityLogger.logPathTraversalAttempt('/storage', key, ip);
    throw new Error('Invalid file path');
  }
  
  // Ensure key doesn't start with /
  if (key.startsWith('/')) {
    key = key.substring(1);
  }
  
  // Validate key components
  const parts = key.split('/');
  for (const part of parts) {
    if (!part || part === '.' || part === '..' || part.includes('\0')) {
      throw new Error('Invalid file path component');
    }
  }
  
  // Limit key length
  if (key.length > 255) {
    throw new Error('File path too long');
  }
  
  return key;
}

/**
 * Initialize S3 client
 */
export function initS3Client(config: StorageConfig): S3Client {
  s3Client = new S3Client({
    endpoint: config.endpoint,
    region: config.region || 'auto',
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    },
    forcePathStyle: true // Required for R2 and some S3-compatible services
  });

  return s3Client;
}

/**
 * Get S3 client instance
 */
export function getS3Client(): S3Client {
  if (!s3Client) {
    const env = getEnv();
    if (!env.STORAGE_ENDPOINT || !env.STORAGE_ACCESS_KEY_ID || !env.STORAGE_SECRET_ACCESS_KEY || !env.STORAGE_BUCKET) {
      throw new Error('Storage not configured. Set STORAGE_* environment variables.');
    }

    s3Client = initS3Client({
      endpoint: env.STORAGE_ENDPOINT,
      accessKeyId: env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
      bucket: env.STORAGE_BUCKET,
      region: env.STORAGE_REGION,
      publicUrl: env.STORAGE_PUBLIC_URL
    });
  }

  return s3Client;
}

/**
 * Generate presigned URL for upload
 */
export async function getUploadUrl(options: UploadOptions): Promise<{
  url: string;
  key: string;
  fields?: Record<string, string>;
}> {
  const client = getS3Client();
  const env = getEnv();
  const bucket = env.STORAGE_BUCKET!;

  // Validate and sanitize the key
  const sanitizedKey = validateS3Key(options.key);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: sanitizedKey,
    ContentType: options.contentType,
    ContentLength: options.contentLength,
    ...(options.checksum ? { ChecksumSHA256: options.checksum } : {}),
    Metadata: options.metadata,
    // Set server-side encryption
    ServerSideEncryption: 'AES256',
    // Set ACL to private by default
    ACL: 'private'
  });

  // Shorter expiration time for security
  const url = await getSignedUrl(client, command, { expiresIn: 900 }); // 15 minutes

  return {
    url,
    key: sanitizedKey
  };
}

/**
 * Generate presigned URL for download
 */
export async function getDownloadUrl(
  key: string,
  options?: SignedUrlOptions
): Promise<string> {
  const client = getS3Client();
  const env = getEnv();

  // If public URL is configured and object is public, use it
  if (env.STORAGE_PUBLIC_URL && !options?.download) {
    return `${env.STORAGE_PUBLIC_URL}/${key}`;
  }

  const bucket = env.STORAGE_BUCKET!;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ...(options?.filename ? { ResponseContentDisposition: `attachment; filename="${options.filename}"` } : {})
  });

  return getSignedUrl(client, command, {
    expiresIn: options?.expiresIn || 3600
  });
}

/**
 * Delete object from storage
 */
export async function deleteObject(key: string): Promise<void> {
  const client = getS3Client();
  const env = getEnv();
  const bucket = env.STORAGE_BUCKET!;

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });

  await client.send(command);
}

/**
 * Check if object exists
 */
export async function objectExists(key: string): Promise<boolean> {
  try {
    const client = getS3Client();
    const env = getEnv();
    const bucket = env.STORAGE_BUCKET!;

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key
    });

    await client.send(command);
    return true;
  } catch (error) {
    if ((error as { name?: string }).name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Upload file directly (server-side only)
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<void> {
  const client = getS3Client();
  const env = getEnv();
  const bucket = env.STORAGE_BUCKET!;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata
  });

  await client.send(command);
}

