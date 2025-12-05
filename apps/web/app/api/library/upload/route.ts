import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { handleApiError, AppError } from '@/lib/errors';
import { checkRateLimit, uploadLimiter } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/session';
import { createBrowserClient } from '@/lib/supabase';
import { getUsageSummary } from '@/lib/usage-tracking';

// Valid MIME types by category
const VALID_MIME_TYPES = {
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/aiff',
    'audio/flac',
    'audio/ogg',
    'audio/x-m4a',
    'audio/mp4',
    'audio/x-wav',
    'audio/x-aiff',
  ],
  midi: ['audio/midi', 'audio/x-midi', 'application/x-midi'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/rtf',
    'application/rtf',
    // Additional text MIME types that browsers may send
    'text/x-plain',
    'text/x-markdown',
    'text/x-rst',
    'text/richtext',
  ],
  image: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
  ],
  project: [
    'application/octet-stream', // Generic binary for DAW files
  ],
};

// File types that should be accepted with application/octet-stream or empty MIME type
// (Some browsers don't properly detect these file types)
const EXTENSION_ALLOWS_UNKNOWN_MIME =
  /\.(txt|md|rtf|chordpro|cho|crd|als|flp|logic|logicx|ptx|ptf|rpp|cpr|band|sesx|aup|aup3)$/i;

// All valid MIME types combined
const ALL_VALID_MIME_TYPES = [
  ...VALID_MIME_TYPES.audio,
  ...VALID_MIME_TYPES.midi,
  ...VALID_MIME_TYPES.document,
  ...VALID_MIME_TYPES.image,
  ...VALID_MIME_TYPES.project,
];

// Valid file extensions by category
const VALID_EXTENSIONS = {
  audio: /\.(mp3|wav|aiff|aif|flac|ogg|m4a|wma)$/i,
  midi: /\.(mid|midi)$/i,
  document: /\.(pdf|doc|docx|txt|md|rtf|pages)$/i,
  image: /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|tif)$/i,
  lyrics: /\.(txt|md|rtf|doc|docx|pdf)$/i,
  chords: /\.(txt|pdf|png|jpg|jpeg|chordpro|cho|crd)$/i,
  sheet_music: /\.(pdf|png|jpg|jpeg|musicxml|mxl)$/i,
  project: /\.(als|flp|logic|logicx|ptx|ptf|rpp|cpr|band|sesx|aup|aup3)$/i,
};

// Check if any extension matches
const matchesAnyExtension = (filename: string): boolean => {
  return Object.values(VALID_EXTENSIONS).some((regex) => regex.test(filename));
};

// Library file type enum - must match Prisma LibraryFileType
const libraryFileTypeSchema = z.enum([
  'stem',
  'demo',
  'sample',
  'loop',
  'lyrics',
  'chords',
  'sheet_music',
  'midi',
  'image',
  'document',
  'project',
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
    const isValidMime = ALL_VALID_MIME_TYPES.includes(file.type);
    const isValidExtension = matchesAnyExtension(file.name);

    // Allow files with valid extensions even if MIME type is empty or generic
    // (Some browsers don't properly detect text/plain for .txt files)
    const hasUnknownMimeButValidExtension =
      (!file.type || file.type === 'application/octet-stream' || file.type === '') &&
      isValidExtension;

    // Also allow specific extensions that commonly have MIME detection issues
    const hasKnownProblematicExtension = EXTENSION_ALLOWS_UNKNOWN_MIME.test(file.name);

    if (
      !isValidMime &&
      !isValidExtension &&
      !hasUnknownMimeButValidExtension &&
      !hasKnownProblematicExtension
    ) {
      throw AppError.badRequest(
        'Invalid file type. Supported formats: audio (mp3, wav, flac, etc.), documents (pdf, txt, docx), images (jpg, png), MIDI, chord charts, sheet music, and DAW project files.'
      );
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
      throw AppError.quotaExceeded('Storage', usage.storage.used, usage.storage.limit, usage.tier);
    }

    // Create Supabase client
    const supabase = createBrowserClient();
    if (!supabase) {
      throw new AppError('Storage service unavailable', 'SERVICE_UNAVAILABLE', 503);
    }

    // Calculate file hash for duplicate detection
    const fileBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Check for duplicates (using original name and size as proxy for hash)
    const existingFile = await prisma.libraryFile.findFirst({
      where: {
        userId: user.id,
        originalName: file.name,
        size: BigInt(file.size),
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    if (existingFile) {
      // Return duplicate info instead of error (let frontend decide)
      return NextResponse.json(
        {
          isDuplicate: true,
          existingFile: {
            id: existingFile.id,
            name: existingFile.name,
            createdAt: existingFile.createdAt,
          },
          message: `This file appears to be a duplicate of "${existingFile.name}" uploaded on ${existingFile.createdAt.toLocaleDateString()}`,
        },
        { status: 200 }
      );
    }

    // Create unique filename (sanitize to prevent path traversal)
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.{2,}/g, '.'); // Prevent directory traversal
    const filePath = `library/${user.id}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage (use buffer we already have)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
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
