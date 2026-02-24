import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkRateLimit, standardLimiter, uploadLimiter } from '@/lib/rate-limit';

const MAX_SAMPLES = 10;
const MAX_TITLE_LENGTH = 100;
const MAX_GENRE_LENGTH = 50;

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const samples = await prisma.musicSample.findMany({
      where: { userId: session.user.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ samples });
  } catch (error) {
    console.error('Error fetching music samples:', error);
    return NextResponse.json({ error: 'Failed to fetch music samples' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit uploads
    try {
      await checkRateLimit(uploadLimiter, `music-sample:${session.user.id}`);
    } catch {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait before uploading more.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { title, audioUrl, audioPath, duration, genre } = body;

    // Validate required fields
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!audioUrl || typeof audioUrl !== 'string') {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    if (!audioPath || typeof audioPath !== 'string') {
      return NextResponse.json({ error: 'Audio path is required' }, { status: 400 });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Title must be between 1 and ${MAX_TITLE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate genre if provided
    const trimmedGenre = genre?.trim() || null;
    if (trimmedGenre && trimmedGenre.length > MAX_GENRE_LENGTH) {
      return NextResponse.json(
        { error: `Genre must be ${MAX_GENRE_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Validate duration if provided
    const parsedDuration = duration ? parseInt(String(duration), 10) : null;
    if (parsedDuration !== null && (isNaN(parsedDuration) || parsedDuration < 0 || parsedDuration > 3600)) {
      return NextResponse.json({ error: 'Duration must be between 0 and 3600 seconds' }, { status: 400 });
    }

    // Check sample count limit
    const existingCount = await prisma.musicSample.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= MAX_SAMPLES) {
      return NextResponse.json(
        { error: `You can upload a maximum of ${MAX_SAMPLES} music samples` },
        { status: 400 }
      );
    }

    const sample = await prisma.musicSample.create({
      data: {
        userId: session.user.id,
        title: trimmedTitle,
        audioUrl,
        audioPath,
        duration: parsedDuration,
        genre: trimmedGenre,
        sortOrder: existingCount,
      },
    });

    return NextResponse.json({ success: true, sample });
  } catch (error) {
    console.error('Error creating music sample:', error);
    return NextResponse.json({ error: 'Failed to create music sample' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await checkRateLimit(standardLimiter, `music-sample-delete:${session.user.id}`);
    } catch {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const sampleId = searchParams.get('id');

    if (!sampleId) {
      return NextResponse.json({ error: 'Sample ID is required' }, { status: 400 });
    }

    // Verify ownership
    const sample = await prisma.musicSample.findFirst({
      where: {
        id: sampleId,
        userId: session.user.id,
      },
    });

    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
    }

    await prisma.musicSample.delete({
      where: { id: sampleId },
    });

    return NextResponse.json({
      success: true,
      audioPath: sample.audioPath,
    });
  } catch (error) {
    console.error('Error deleting music sample:', error);
    return NextResponse.json({ error: 'Failed to delete music sample' }, { status: 500 });
  }
}
