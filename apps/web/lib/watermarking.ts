/**
 * Audio watermarking utilities
 * BUG FIX: Implements watermarking to prevent unauthorized distribution
 */

import crypto from 'crypto';

export interface WatermarkMetadata {
  watermark: string;
  timestamp: number;
  userId?: string;
  projectId?: string;
  assetId?: string;
}

/**
 * Generate a watermark ID for an asset
 */
export function generateWatermark(userId?: string, projectId?: string, assetId?: string): string {
  const data = [
    userId || 'anonymous',
    projectId || 'none',
    assetId || 'none',
    Date.now().toString()
  ].join(':');

  // Create a hash-based watermark (in production, use proper audio watermarking)
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `SF-${hash.substring(0, 16).toUpperCase()}`;
}

/**
 * Create watermark metadata
 */
export function createWatermarkMetadata(
  userId?: string,
  projectId?: string,
  assetId?: string
): WatermarkMetadata {
  return {
    watermark: generateWatermark(userId, projectId, assetId),
    timestamp: Date.now(),
    userId,
    projectId,
    assetId
  };
}

/**
 * Extract watermark from metadata (without exposing secrets)
 */
export function extractWatermark(metadata: Record<string, unknown>): string | null {
  const watermarkData = metadata.watermark as WatermarkMetadata | string | undefined;
  
  if (typeof watermarkData === 'string') {
    return watermarkData;
  }
  
  if (typeof watermarkData === 'object' && watermarkData !== null && 'watermark' in watermarkData) {
    return (watermarkData as WatermarkMetadata).watermark;
  }
  
  return null;
}

/**
 * Validate watermark format
 */
export function isValidWatermark(watermark: string): boolean {
  return /^SF-[A-F0-9]{16}$/.test(watermark);
}






