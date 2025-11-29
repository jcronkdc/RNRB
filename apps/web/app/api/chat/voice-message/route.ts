/**
 * Voice Message Storage API
 *
 * Handles upload and storage of voice messages to Supabase Storage
 * Integrates with chat system via Ably
 *
 * POST /api/chat/voice-message
 * - Uploads voice message audio file
 * - Stores metadata in database
 * - Broadcasts to Ably channel
 * - Returns message object
 */

import { prisma as db } from '@cronkwaters/db';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { uploadLimiter, standardLimiter, checkRateLimit } from '@/lib/rate-limit';

// Server-side Supabase client for storage operations only (NOT for auth)
function getSupabaseStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase storage configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    // Use NextAuth for authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = { id: session.user.id, email: session.user.email };

    // Rate limit: 30 voice messages per minute (uploads)
    await checkRateLimit(uploadLimiter, `voice-message-upload:${user.id}`);

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const channelId = formData.get('channelId') as string;
    const channelType = formData.get('channelType') as string;
    const duration = parseInt(formData.get('duration') as string);

    // Safely parse waveform data
    let waveformData: number[] | null = null;
    const waveformRaw = formData.get('waveformData') as string | null;
    if (waveformRaw) {
      try {
        waveformData = JSON.parse(waveformRaw);
      } catch (e) {
        console.warn('Failed to parse waveform data:', e);
        // Continue without waveform data
      }
    }

    if (!audioFile || !channelId || !channelType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user details from database
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate unique file name
    const timestamp = Date.now();
    const fileName = `voice-messages/${channelId}/${user.id}-${timestamp}.webm`;

    // Compress audio if it's too large (> 5MB)
    const fileToUpload: File | Blob = audioFile;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (audioFile.size > maxSize) {
      // For large files, we could implement server-side compression
      // For now, we'll add metadata to track compression needs
      console.warn(
        `Large voice message (${(audioFile.size / 1024 / 1024).toFixed(2)}MB) - consider compression`
      );
    }

    // Upload to Supabase Storage with optimization
    const supabase = getSupabaseStorageClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-messages')
      .upload(fileName, fileToUpload, {
        contentType: audioFile.type || 'audio/webm',
        upsert: false,
        cacheControl: '3600', // Cache for 1 hour
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('voice-messages').getPublicUrl(fileName);

    // Save message to database
    const message = await db.chatMessage.create({
      data: {
        channelId,
        channelType: channelType as any,
        senderId: user.id,
        senderName: dbUser.name || dbUser.email || 'Unknown',
        senderEmail: dbUser.email || '',
        senderAvatar: dbUser.image,
        messageType: 'voice',
        audioUrl: publicUrl,
        audioPath: fileName,
        audioDuration: duration,
        waveformData: waveformData as unknown as Parameters<
          typeof db.chatMessage.create
        >[0]['data']['waveformData'],
      },
    });

    // Broadcast to Ably channel
    if (process.env.ABLY_API_KEY) {
      const Ably = (await import('ably')).default;
      const ably = new Ably.Rest(process.env.ABLY_API_KEY);
      const channel = ably.channels.get(channelId);

      await channel.publish('voice-message', {
        messageId: message.id,
        senderId: user.id,
        senderName: dbUser.name || dbUser.email,
        senderAvatar: dbUser.image,
        audioUrl: publicUrl,
        duration,
        waveformData,
        timestamp: message.createdAt.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        audioUrl: publicUrl,
        duration,
        waveformData,
        sender: {
          id: user.id,
          name: dbUser.name,
          avatar: dbUser.image,
        },
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Voice message API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get voice messages for a channel
export async function GET(request: NextRequest) {
  try {
    // Use NextAuth for authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `voice-message-read:${session.user.id}`);

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ error: 'channelId required' }, { status: 400 });
    }

    // Parse and validate pagination parameters
    const limitParam = parseInt(searchParams.get('limit') || '50');

    if (isNaN(limitParam) || limitParam < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter: must be a positive integer' },
        { status: 400 }
      );
    }

    const limit = Math.min(limitParam, 100); // Max 100 messages per request

    // Get messages from database
    const messages = await db.chatMessage.findMany({
      where: {
        channelId,
        messageType: 'voice',
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      messages: messages.reverse(), // Oldest first
    });
  } catch (error) {
    console.error('Get voice messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
