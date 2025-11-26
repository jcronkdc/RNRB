import { NextRequest, NextResponse } from 'next/server';

import { handleApiError, AppError } from '@/lib/errors';
import { requireAuth } from '@/lib/session';
import { createBrowserClient } from '@/lib/supabase';
import { checkRateLimit, uploadLimiter } from '@/lib/rate-limit';
import { getUsageSummary } from '@/lib/usage-tracking';
import { prisma } from '@cronkwaters/db';
import { z } from 'zod';

// Valid audio MIME types
const VALID_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/aiff',
  'audio/flac',
  'audio/ogg',
  'audio/x-m4a',
  'audio/mp4',
];

// Valid file extensions (fallback for when MIME type is unreliable)
const VALID_EXTENSIONS = /\.(mp3|wav|aiff|flac|ogg|m4a)$/i;

// Library file type enum - must match Prisma LibraryFileType
const libraryFileTypeSchema = z.enum([
  'stem',
  'demo',
  'sample',
  'loop',
  'other',
]);

// Tags validation schema
const tagsSchema = z.array(z.string().max(50)).max(20).default([]);

/**
 * POST /api/library/upload
 * Upload a file to the library
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Rate limiting
    await checkRateLimit(uploadLimiter, user.id);

    const formData = await req.formData();
    const file = formData.get('file');
    const typeRaw = formData.get('type');
    const tagsRaw = formData.get('tags');

    // Validate file exists and is a File
    if (!file || !(file instanceof File)) {
      throw AppError.badRequest('No file provided or invalid file');
    }

    // Validate file type
    const isValidMime = VALID_AUDIO_TYPES.includes(file.type);
    const isValidExtension = VALID_EXTENSIONS.test(file.name);

    if (!isValidMime && !isValidExtension) {
      throw AppError.badRequest('Invalid file type. Please upload audio files only (mp3, wav, aiff, flac, ogg, m4a)');
    }

    // Validate and parse type
    const type = libraryFileTypeSchema.safeParse(typeRaw);
    const fileType = type.success ? type.data : 'other';

    // Validate and parse tags
    let parsedTags: string[] = [];
    if (tagsRaw && typeof tagsRaw === 'string') {
      try {
        const parsed = JSON.parse(tagsRaw);
        const validated = tagsSchema.safeParse(parsed);
        parsedTags = validated.success ? validated.data : [];
      } catch {
        // Invalid JSON, ignore tags
        parsedTags = [];
      }
    }

    // Get usage summary for tier-based limits
    const usage = await getUsageSummary(user.id);

    // Validate file size based on tier
    const tierMaxSize =
      usage.tier === 'studio'
        ? 500 * 1024 * 1024 // 500MB
        : usage.tier === 'creator'
          ? 100 * 1024 * 1024 // 100MB
          : 50 * 1024 * 1024; // 50MB for free

    if (file.size > tierMaxSize) {
      throw new AppError(
        `File too large. Maximum size for ${usage.tier} tier is ${tierMaxSize / (1024 * 1024)}MB.`,
        'BAD_REQUEST',
        413,
        undefined,
        { requiresUpgrade: usage.tier !== 'studio', currentTier: usage.tier }
      );
    }

    // Check storage quota
    const fileSizeGB = file.size / (1024 * 1024 * 1024);
    if (usage.storage.remaining < fileSizeGB) {
      throw AppError.quotaExceeded(
        'Storage',
        usage.storage.used,
        usage.storage.limit,
        usage.tier
      );
    }

    // Create Supabase client
    const supabase = createBrowserClient();
    if (!supabase) {
      throw new AppError('Storage service unavailable', 'SERVICE_UNAVAILABLE', 503);
    }

    // Create unique filename (sanitize to prevent path traversal)
    const timestamp = Date.now();
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.'); // Prevent directory traversal
    const filePath = `library/${user.id}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new AppError(
        'Failed to upload file. Please try again.',
        'INTERNAL_ERROR',
        500,
        uploadError.message
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('audio-files').getPublicUrl(filePath);

    // Create library file entry in database
    const libraryFile = await prisma.libraryFile.create({
      data: {
        userId: user.id,
        name: file.name,
        originalName: file.name,
        url: urlData.publicUrl,
        path: filePath,
        size: BigInt(file.size),
        mimeType: file.type,
        type: fileType,
        tags: parsedTags,
      },
    });

    // Update storage usage
    await prisma.user.update({
      where: { id: user.id },
      data: {
        storageUsedGB: {
          increment: fileSizeGB,
        },
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedFile = {
      ...libraryFile,
      size: libraryFile.size.toString(),
    };

    return NextResponse.json(serializedFile, { status: 201 });
  } catch (error) {
    return handleApiError(error, { route: '/api/library/upload', method: 'POST' });
  }
}
