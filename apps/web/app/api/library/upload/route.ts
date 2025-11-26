import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createBrowserClient } from '@/lib/supabase';
import { prisma } from '@cronkwaters/db';
import { getUsageSummary } from '@/lib/usage-tracking';

/**
 * POST /api/library/upload
 * Upload a file to the library
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/aiff',
      'audio/flac',
      'audio/ogg',
      'audio/x-m4a',
      'audio/mp4',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|aiff|flac|ogg|m4a)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload audio files only.' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB for Studio, 100MB for Creator, 50MB for Free)
    const usage = await getUsageSummary(session.user.id);
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

    // 🔒 CHECK STORAGE QUOTA
    const fileSizeGB = file.size / (1024 * 1024 * 1024);
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

    // Create Supabase client
    const supabase = createBrowserClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Storage service unavailable' },
        { status: 503 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `library/${session.user.id}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath);

    // Parse tags
    const parsedTags = tags ? JSON.parse(tags) : [];

    // Create library file entry in database
    const libraryFile = await prisma.libraryFile.create({
      data: {
        userId: session.user.id,
        name: file.name,
        originalName: file.name,
        url: urlData.publicUrl,
        path: filePath,
        size: BigInt(file.size),
        mimeType: file.type,
        type: type || 'other',
        tags: parsedTags,
      },
    });

    // 📊 UPDATE STORAGE USAGE
    await prisma.user.update({
      where: { id: session.user.id },
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
    console.error('Error uploading library file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

