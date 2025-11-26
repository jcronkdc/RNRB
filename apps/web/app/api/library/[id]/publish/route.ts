import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@cronkwaters/db';

/**
 * POST /api/library/[id]/publish
 * Publish a library file to the community
 * 
 * This creates a CommunityTrack from a LibraryFile by:
 * 1. Creating a temporary Song record (required by CommunityTrack schema)
 * 2. Creating a CommunityTrack linked to that Song
 * 3. Making the content publicly accessible
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params for Next.js 15
    const { id } = await params;

    // Get the library file
    const libraryFile = await prisma.libraryFile.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!libraryFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if this file is already published
    // We'll check if there's a Song with this library file's name and user
    const existingSong = await prisma.song.findFirst({
      where: {
        title: libraryFile.name,
        userId: session.user.id,
      },
      include: {
        communityTrack: true,
      },
    });

    if (existingSong?.communityTrack) {
      return NextResponse.json(
        { error: 'This file is already published to the community' },
        { status: 400 }
      );
    }

    // Get user's default org or create a personal project
    const userOrg = await prisma.org.findFirst({
      where: {
        memberships: {
          some: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!userOrg) {
      return NextResponse.json(
        { error: 'No organization found. Please create an organization first.' },
        { status: 400 }
      );
    }

    // Get or create a project for library files
    let project = await prisma.project.findFirst({
      where: {
        orgId: userOrg.id,
        name: 'Library Files',
      },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          orgId: userOrg.id,
          name: 'Library Files',
          slug: `library-files-${Date.now()}`,
          visibility: 'public',
          status: 'active',
        },
      });
    }

    // Create a Song record for this library file
    const song = await prisma.song.create({
      data: {
        title: libraryFile.name,
        userId: session.user.id,
        projectId: project.id,
        status: 'complete',
        visibility: 'public',
        // Add basic metadata from the library file
        description: `Published from Library: ${libraryFile.type}`,
      },
    });

    // Create the CommunityTrack
    const communityTrack = await prisma.communityTrack.create({
      data: {
        songId: song.id,
        userId: session.user.id,
        audioUrl: libraryFile.url,
        audioPath: libraryFile.path,
        duration: libraryFile.duration || 0,
        genre: libraryFile.type === 'demo' ? 'Demo' : libraryFile.type.charAt(0).toUpperCase() + libraryFile.type.slice(1),
        allowDownload: true,
        allowRemix: true,
        isExplicit: false,
      },
    });

    return NextResponse.json({
      message: 'File published successfully',
      communityTrackId: communityTrack.id,
      songId: song.id,
    });
  } catch (error) {
    console.error('Error publishing library file:', error);
    return NextResponse.json(
      { error: 'Failed to publish file' },
      { status: 500 }
    );
  }
}

