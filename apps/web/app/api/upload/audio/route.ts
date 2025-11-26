import { type NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/supabase';
import { getUsageSummary } from '@/lib/usage-tracking';

/**
 * Audio Upload Endpoint
 *
 * INTEGRATION OPTIONS:
 * 1. Supabase Storage (already have Supabase)
 * 2. Vercel Blob (simple, integrated)
 * 3. AWS S3 (enterprise-grade)
 *
 * Starting with Supabase Storage (most integrated with current stack)
 */

export async function POST(request: NextRequest) {
  try {
    // ✅ SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const songId = formData.get('songId') as string;
    const projectSlug = formData.get('projectSlug') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (audio only)
    const allowedTypes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/aiff',
      'audio/flac',
      'audio/ogg',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: WAV, MP3, AIFF, FLAC, OGG' },
        { status: 400 }
      );
    }

    // 🔒 CHECK STORAGE QUOTA
    const usage = await getUsageSummary(user.id);
    const fileSizeGB = file.size / (1024 * 1024 * 1024);
    
    // Validate file size based on tier
    const tierMaxSize = 
      usage.tier === 'studio' ? 500 * 1024 * 1024 : // 500MB
      usage.tier === 'creator' ? 100 * 1024 * 1024 : // 100MB
      50 * 1024 * 1024; // 50MB for free

    if (file.size > tierMaxSize) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size for ${usage.tier} tier is ${tierMaxSize / (1024 * 1024)}MB.`,
          requiresUpgrade: usage.tier !== 'studio',
          currentTier: usage.tier,
        },
        { status: 413 } // Payload Too Large
      );
    }

    // Check if user has enough storage quota
    if (usage.storage.remaining < fileSizeGB) {
      return NextResponse.json(
        {
          error: `Storage quota exceeded. You have ${usage.storage.remaining.toFixed(2)}GB remaining, but need ${fileSizeGB.toFixed(2)}GB.`,
          requiresUpgrade: true,
          currentTier: usage.tier,
          used: usage.storage.used,
          limit: usage.storage.limit,
          percentage: usage.storage.percentage,
        },
        { status: 413 } // Payload Too Large
      );
    }

    // TODO: Upload to Supabase Storage
    // TODO: Update user storage usage
    // For now, return placeholder response
    return NextResponse.json({
      success: true,
      message: 'File upload feature launching soon',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      storageQuota: {
        used: usage.storage.used,
        limit: usage.storage.limit,
        remaining: usage.storage.remaining,
        percentageUsed: usage.storage.percentage,
      },
      note: 'Supabase Storage integration coming in next phase',
    });
  } catch (error: any) {
    console.error('Audio upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};
