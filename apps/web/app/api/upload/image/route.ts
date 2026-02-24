import { auth } from '@cronkwaters/auth';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

import { checkRateLimit, uploadLimiter } from '@/lib/rate-limit';

// Lazy initialization to avoid build-time errors
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// POST /api/upload/image - Upload image to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 uploads per minute
    try {
      await checkRateLimit(uploadLimiter, `image-upload:${session.user.id}`);
    } catch {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Validate Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[IMAGE-UPLOAD] Supabase configuration missing');
      return NextResponse.json(
        { error: 'Storage configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestedBucket = (formData.get('bucket') as string) || 'site-images';

    // Restrict to allowed buckets only
    const ALLOWED_BUCKETS = ['site-images', 'profile-images', 'merch-designs', 'project-covers'];
    const bucket = ALLOWED_BUCKETS.includes(requestedBucket) ? requestedBucket : 'site-images';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (10MB limit for merch-designs, 5MB for others)
    const maxSize = bucket === 'merch-designs' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be under ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename with sanitized extension
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage with proper options
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
      duplex: 'half', // Required for some Node.js versions
    });

    if (error) {
      console.error('[IMAGE-UPLOAD] Supabase storage error:', {
        message: error.message,
        bucket,
        fileName,
        fileSize: file.size,
        contentType: file.type,
      });

      // Provide more helpful error messages
      if (error.message.includes('row-level security')) {
        return NextResponse.json(
          { error: 'Storage permissions error. Please contact support.' },
          { status: 403 }
        );
      }

      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    console.log('[IMAGE-UPLOAD] Upload successful:', {
      bucket,
      path: data.path,
      url: urlData.publicUrl,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      bucket,
    });
  } catch (error) {
    console.error('[IMAGE-UPLOAD] Unexpected error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/upload/image - Delete image from Supabase Storage
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const requestedBucket = searchParams.get('bucket') || 'site-images';

    // Restrict to allowed buckets only (same as POST)
    const ALLOWED_BUCKETS = ['site-images', 'profile-images', 'merch-designs', 'project-covers'];
    const bucket = ALLOWED_BUCKETS.includes(requestedBucket) ? requestedBucket : 'site-images';

    if (!path) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    // Verify user owns the file (path should start with their user ID)
    if (!path.startsWith(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('[IMAGE-DELETE] Supabase error:', error);
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[IMAGE-DELETE] Error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
