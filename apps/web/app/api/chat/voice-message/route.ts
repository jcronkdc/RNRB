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

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { prisma as db } from '@cronkwaters/db';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const channelId = formData.get('channelId') as string;
    const channelType = formData.get('channelType') as string;
    const duration = parseInt(formData.get('duration') as string);
    const waveformData = JSON.parse(formData.get('waveformData') as string);

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
    let fileToUpload: File | Blob = audioFile;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (audioFile.size > maxSize) {
      // For large files, we could implement server-side compression
      // For now, we'll add metadata to track compression needs
      console.warn(`Large voice message (${(audioFile.size / 1024 / 1024).toFixed(2)}MB) - consider compression`);
    }

    // Upload to Supabase Storage with optimization
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
        waveformData,
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get voice messages for a channel
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    
    const limit = limitParam;

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

