import { prisma, LibraryFileType } from '@cronkwaters/db';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

import { auth } from '@/auth';

// File type detection based on MIME type
function detectLibraryFileType(mimeType: string, fileName: string): string {
  // Audio files
  if (mimeType.startsWith('audio/')) {
    if (mimeType.includes('midi')) return 'midi';
    // Default audio to demo unless it's clearly a stem or sample
    if (fileName.toLowerCase().includes('stem')) return 'stem';
    if (fileName.toLowerCase().includes('sample')) return 'sample';
    if (fileName.toLowerCase().includes('loop')) return 'loop';
    return 'demo';
  }

  // Images
  if (mimeType.startsWith('image/')) return 'image';

  // Documents
  if (mimeType === 'application/pdf') return 'document';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';

  // Text files - check for lyrics/chords patterns
  if (mimeType.startsWith('text/') || fileName.match(/\.(txt|md|rtf)$/i)) {
    if (fileName.toLowerCase().includes('lyric')) return 'lyrics';
    if (fileName.toLowerCase().includes('chord')) return 'chords';
    return 'lyrics'; // Default text to lyrics for musicians
  }

  // MIDI
  if (fileName.match(/\.(mid|midi)$/i)) return 'midi';

  // Sheet music formats
  if (fileName.match(/\.(musicxml|mxl)$/i)) return 'sheet_music';

  // DAW project files
  if (fileName.match(/\.(als|flp|logic|ptx|rpp|cpr)$/i)) return 'project';

  return 'other';
}

interface SaveAttachmentRequest {
  attachmentId: string;
  messageId: string;
  name: string;
  content: string; // Base64 encoded
  mimeType: string;
  size: number;
  // Optional metadata
  collectionId?: string;
  tags?: string[];
  notes?: string;
}

/**
 * POST /api/email/attachments/save
 * Save an email attachment to the user's library
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has an email account
    const emailAccount = await prisma.emailAccount.findFirst({
      where: { userId: session.user.id, status: 'ACTIVE' },
    });

    if (!emailAccount) {
      return NextResponse.json({ error: 'No active email account found' }, { status: 400 });
    }

    const body: SaveAttachmentRequest = await req.json();
    const { attachmentId, messageId, name, content, mimeType, size, collectionId, tags, notes } =
      body;

    // Validate required fields
    if (!name || !content || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, content, mimeType' },
        { status: 400 }
      );
    }

    // Check storage limits (5GB for free tier)
    const storageUsed = await prisma.libraryFile.aggregate({
      where: { userId: session.user.id },
      _sum: { size: true },
    });

    const currentUsage = Number(storageUsed._sum.size || 0);
    const storageLimit = 5 * 1024 * 1024 * 1024; // 5GB

    if (currentUsage + size > storageLimit) {
      return NextResponse.json(
        { error: 'Storage limit exceeded. Please upgrade or delete some files.' },
        { status: 400 }
      );
    }

    // Decode base64 content
    const fileBuffer = Buffer.from(content, 'base64');

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `library/${session.user.id}/email-attachments/${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(filePath, fileBuffer, {
      access: 'public',
      contentType: mimeType,
    });

    // Detect file type for library
    const fileType = detectLibraryFileType(mimeType, name);

    // Create library file entry
    const libraryFile = await prisma.libraryFile.create({
      data: {
        userId: session.user.id,
        name,
        originalName: name,
        url: blob.url,
        path: filePath,
        size: BigInt(size),
        mimeType,
        type: fileType as LibraryFileType,
        tags: tags || [`email-attachment`, `from-${messageId ? 'message' : 'email'}`],
        notes: notes || `Saved from email${messageId ? ` (Message ID: ${messageId})` : ''}`,
        collectionId: collectionId || undefined,
      },
    });

    // Return the created file
    return NextResponse.json({
      success: true,
      message: 'Attachment saved to library',
      file: {
        id: libraryFile.id,
        name: libraryFile.name,
        type: libraryFile.type,
        url: libraryFile.url,
        size: libraryFile.size.toString(),
        mimeType: libraryFile.mimeType,
      },
    });
  } catch (error) {
    console.error('Error saving attachment to library:', error);
    return NextResponse.json({ error: 'Failed to save attachment' }, { status: 500 });
  }
}

/**
 * GET /api/email/attachments/save
 * Get info about a saved attachment
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attachmentHash = searchParams.get('hash');

    if (!attachmentHash) {
      return NextResponse.json({ error: 'Attachment hash required' }, { status: 400 });
    }

    // Check if this attachment has already been saved
    // We use a hash or name match to avoid duplicates
    const existingFile = await prisma.libraryFile.findFirst({
      where: {
        userId: session.user.id,
        originalName: attachmentHash,
        tags: { has: 'email-attachment' },
      },
    });

    return NextResponse.json({
      alreadySaved: !!existingFile,
      file: existingFile
        ? {
            id: existingFile.id,
            name: existingFile.name,
            url: existingFile.url,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking attachment:', error);
    return NextResponse.json({ error: 'Failed to check attachment' }, { status: 500 });
  }
}
