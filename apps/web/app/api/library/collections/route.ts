import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';

/**
 * GET /api/library/collections
 * List all collections for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await prisma.libraryCollection.findMany({
      where: { userId: session.user.id },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { files: true },
        },
      },
    });

    // Add fileCount to each collection
    const collectionsWithCount = collections.map((c) => ({
      ...c,
      fileCount: c._count.files,
      _count: undefined,
    }));

    return NextResponse.json(collectionsWithCount);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

/**
 * POST /api/library/collections
 * Create a new collection
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, color, icon } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    // Check if collection with same name exists
    const existing = await prisma.libraryCollection.findUnique({
      where: {
        userId_name: {
          userId: session.user.id,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A collection with this name already exists' },
        { status: 400 }
      );
    }

    // Get max sort order
    const maxOrder = await prisma.libraryCollection.findFirst({
      where: { userId: session.user.id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const collection = await prisma.libraryCollection.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
        icon: icon || null,
        sortOrder: (maxOrder?.sortOrder || 0) + 1,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
