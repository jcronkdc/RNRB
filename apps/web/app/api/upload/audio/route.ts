/**
 * Audio Upload Endpoint
 *
 * Server-side audio file upload to Supabase Storage
 * - Validates authentication via NextAuth
 * - Enforces storage quotas based on subscription tier
 * - Uploads to Supabase Storage 'audio-files' bucket
 * - Updates user storage usage tracking
 */

import { prisma } from '@cronkwaters/db';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/auth';
import { handleApiError } from '@/lib/errors';
import { checkRateLimit, uploadLimiter } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/security';
import { getUsageSummary, type TierName } from '@/lib/usage-tracking';

export const runtime = 'nodejs';

// Server-side Supabase client for storage (NOT for auth - we use NextAuth)
function getSupabaseStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase storage configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Allowed audio MIME types
const ALLOWED_AUDIO_TYPES = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/aiff',
  'audio/x-aiff',
  'audio/flac',
  'audio/ogg',
  'audio/webm',
  'audio/x-m4a',
  'audio/mp4',
];

// File extension to MIME type mapping
const EXTENSION_TO_MIME: Record<string, string> = {
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
  aiff: 'audio/aiff',
  aif: 'audio/aiff',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
  m4a: 'audio/mp4',
};

// Max file sizes per tier
const TIER_MAX_FILE_SIZE: Record<TierName, number> = {
  free: 50 * 1024 * 1024, // 50MB
  creator: 100 * 1024 * 1024, // 100MB
  studio: 500 * 1024 * 1024, // 500MB
};

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Require authentication via NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    // 🔒 RATE LIMITING: Prevent upload spam (5 uploads per minute per user)
    try {
      await checkRateLimit(uploadLimiter, `audio-upload:${userId}`);
    } catch {
      logSecurityEvent('rate_limit', {
        action: 'audio-upload',
        userId,
      });
      return NextResponse.json(
        { error: 'Too many uploads. Please wait before uploading more files.' },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const songId = formData.get('songId') as string;
    const projectSlug = formData.get('projectSlug') as string;
    const trackType = (formData.get('type') as string) || 'demo';

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!songId || !projectSlug) {
      return NextResponse.json({ error: 'songId and projectSlug are required' }, { status: 400 });
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type || EXTENSION_TO_MIME[fileExtension];

    if (!ALLOWED_AUDIO_TYPES.includes(file.type) && !EXTENSION_TO_MIME[fileExtension]) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed: WAV, MP3, AIFF, FLAC, OGG, WebM, M4A',
          received: file.type,
        },
        { status: 400 }
      );
    }

    // 🔒 CHECK STORAGE QUOTA
    const usage = await getUsageSummary(userId);
    const fileSizeGB = file.size / (1024 * 1024 * 1024);
    const tier = usage.tier as TierName;

    // Check file size limit for tier
    const maxFileSize = TIER_MAX_FILE_SIZE[tier];
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size for ${tier} tier is ${maxFileSize / (1024 * 1024)}MB.`,
          requiresUpgrade: tier !== 'studio',
          currentTier: tier,
          maxSize: maxFileSize,
          fileSize: file.size,
        },
        { status: 413 }
      );
    }

    // Check storage quota
    if (usage.storage.remaining < fileSizeGB) {
      return NextResponse.json(
        {
          error: `Storage quota exceeded. You have ${usage.storage.remaining.toFixed(2)}GB remaining, but need ${fileSizeGB.toFixed(4)}GB.`,
          requiresUpgrade: true,
          currentTier: tier,
          used: usage.storage.used,
          limit: usage.storage.limit,
          percentage: usage.storage.percentage,
        },
        { status: 413 }
      );
    }

    // Generate unique file path (scoped to userId for ownership verification on delete)
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${projectSlug}/${songId}/${trackType}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const supabase = getSupabaseStorageClient();

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);

      // Handle specific errors
      if (uploadError.message?.includes('Bucket not found')) {
        return NextResponse.json(
          {
            error: 'Storage bucket not configured. Please contact support.',
            details: 'audio-files bucket needs to be created in Supabase',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('audio-files').getPublicUrl(filePath);

    // Update user storage usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        storageUsedGB: {
          increment: fileSizeGB,
        },
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        path: filePath,
        url: urlData.publicUrl,
        size: file.size,
        sizeGB: fileSizeGB,
        type: mimeType,
        trackType,
        uploadedAt: new Date().toISOString(),
      },
      storage: {
        used: usage.storage.used + fileSizeGB,
        limit: usage.storage.limit,
        remaining: usage.storage.remaining - fileSizeGB,
        percentageUsed: ((usage.storage.used + fileSizeGB) / usage.storage.limit) * 100,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/upload/audio', method: 'POST' });
  }
}

/**
 * DELETE - Remove an audio file
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = session.user.id;

    // Get file path from query params
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }

    // Security: Prevent path traversal and ensure user owns the file
    // Files are stored as: userId/filename or similar user-scoped paths
    const normalizedPath = filePath.replace(/\.\./g, '').replace(/\/\//g, '/');
    if (normalizedPath !== filePath || !filePath.startsWith(userId + '/')) {
      return NextResponse.json(
        { error: 'Access denied: you can only delete your own files' },
        { status: 403 }
      );
    }

    // Get file metadata from Supabase to determine actual size before deleting
    const supabase = getSupabaseStorageClient();

    let fileSizeGB = 0;
    try {
      const { data: fileList } = await supabase.storage
        .from('audio-files')
        .list(normalizedPath.substring(0, normalizedPath.lastIndexOf('/')), {
          search: normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1),
          limit: 1,
        });
      if (fileList && fileList.length > 0 && fileList[0].metadata?.size) {
        fileSizeGB = fileList[0].metadata.size / (1024 * 1024 * 1024);
      }
    } catch (err) {
      console.warn('[AUDIO-DELETE] Could not fetch file metadata for size:', err);
    }

    const { error: deleteError } = await supabase.storage
      .from('audio-files')
      .remove([normalizedPath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete file', details: deleteError.message },
        { status: 500 }
      );
    }

    // Decrement storage usage by actual file size (or skip if unknown)
    if (fileSizeGB > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          storageUsedGB: {
            decrement: fileSizeGB,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      path: filePath,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/upload/audio', method: 'DELETE' });
  }
}
