/**
 * R&R Labs Contributions API
 *
 * Handles file uploads (audio/MIDI) from volunteers
 * - POST: Upload new contribution
 * - GET: List contributions for authenticated volunteer
 */

import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { handleApiError } from '@/lib/errors';
import { standardLimiter, checkRateLimit } from '@/lib/rate-limit';

// Supported file types
const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp3'];
const SUPPORTED_MIDI_TYPES = ['audio/midi', 'audio/x-midi', 'application/x-midi'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 10 uploads per minute
    await checkRateLimit(standardLimiter, `labs-contributions:${session.user.id}`);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'audio' or 'midi'
    const genre = formData.get('genre') as string | null;
    const bpm = formData.get('bpm') as string | null;
    const key = formData.get('key') as string | null;
    const description = formData.get('description') as string | null;
    const canUseForTraining = formData.get('canUseForTraining') !== 'false';
    const license = formData.get('license') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['audio', 'midi'].includes(type)) {
      return NextResponse.json({ error: 'Invalid contribution type' }, { status: 400 });
    }

    // Validate file type
    const isValidType =
      type === 'audio'
        ? SUPPORTED_AUDIO_TYPES.includes(file.type)
        : SUPPORTED_MIDI_TYPES.includes(file.type);

    if (!isValidType) {
      return NextResponse.json(
        {
          error: `Invalid file type. Supported ${type} types: ${
            type === 'audio' ? 'MP3, WAV, OGG, FLAC' : 'MIDI'
          }`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    const { prisma: db } = await import('@cronkwaters/db');

    // Get volunteer record
    const volunteer = await db.labsVolunteer.findFirst({
      where: {
        OR: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }],
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        {
          error:
            'You must be a registered volunteer to upload contributions. Please sign up first.',
        },
        { status: 403 }
      );
    }

    // For now, we'll store metadata and generate a placeholder URL
    // In production, this would upload to S3/Cloudflare R2
    const fileBuffer = await file.arrayBuffer();
    const fileHash = await crypto.subtle.digest('SHA-256', fileBuffer);
    const hashArray = Array.from(new Uint8Array(fileHash));
    const fileId = hashArray
      .slice(0, 16)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // TODO: Upload to cloud storage
    // const uploadUrl = await uploadToStorage(file, `labs/contributions/${volunteer.id}/${fileId}`);
    const placeholderUrl = `/api/labs/contributions/files/${fileId}`;

    // Estimate duration for audio files (rough estimate based on file size and type)
    let estimatedDuration: number | null = null;
    if (type === 'audio') {
      // Very rough estimate: ~1MB per minute for compressed audio
      estimatedDuration = Math.round((file.size / 1024 / 1024) * 60);
    }

    // Create contribution record
    const contribution = await db.labsContribution.create({
      data: {
        volunteerId: volunteer.id,
        type,
        fileName: file.name,
        fileUrl: placeholderUrl,
        fileSize: file.size,
        duration: estimatedDuration,
        genre: genre || null,
        bpm: bpm ? parseInt(bpm, 10) : null,
        key: key || null,
        description: description || null,
        canUseForTraining,
        license: license || 'CC BY-NC 4.0', // Default to Creative Commons
        status: 'pending',
      },
    });

    // Update volunteer's contribution count
    await db.labsVolunteer.update({
      where: { id: volunteer.id },
      data: {
        [type === 'audio' ? 'audioUploads' : 'midiUploads']: { increment: 1 },
        status: volunteer.status === 'pending' ? 'contributing' : volunteer.status,
        lastActiveAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Contribution uploaded successfully!',
      contribution: {
        id: contribution.id,
        fileName: contribution.fileName,
        type: contribution.type,
        status: contribution.status,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/labs/contributions', method: 'POST' });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prisma: db } = await import('@cronkwaters/db');

    // Get volunteer record
    const volunteer = await db.labsVolunteer.findFirst({
      where: {
        OR: [{ userId: session.user.id }, { email: session.user.email?.toLowerCase() }],
      },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json({
        contributions: [],
        message: 'Not a registered volunteer',
      });
    }

    return NextResponse.json({
      contributions: volunteer.contributions.map((c) => ({
        id: c.id,
        type: c.type,
        fileName: c.fileName,
        fileSize: c.fileSize,
        duration: c.duration,
        genre: c.genre,
        bpm: c.bpm,
        key: c.key,
        status: c.status,
        createdAt: c.createdAt,
      })),
      stats: {
        audioUploads: volunteer.audioUploads,
        midiUploads: volunteer.midiUploads,
      },
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/labs/contributions', method: 'GET' });
  }
}
