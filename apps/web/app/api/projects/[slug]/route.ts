import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

/**
 * GET /api/projects/[slug]
 * Get a single project by slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Get authenticated user from NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug } = await params;

    // Get project by slug
    const project = await db.project.findUnique({
      where: { slug },
      include: {
        members: {
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        songs: {
          select: {
            id: true,
            title: true,
            key: true,
            tempo: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            songs: true,
            members: true,
            studioSessions: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if user has access to this project
    const hasAccess = project.members.some((member) => member.userId === userId);

    if (!hasAccess && project.visibility === 'private') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Transform to match frontend expectations
    const transformedProject = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      tagline: project.tagline,
      cover_image: project.coverImage,
      visibility: project.visibility,
      status: project.status,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
      song_count: project._count.songs,
      collaborator_count: project._count.members,
      session_count: project._count.studioSessions,
      songs: project.songs.map((song) => ({
        id: song.id,
        title: song.title,
        key: song.key,
        tempo: song.tempo,
        status: song.status,
        created_at: song.createdAt.toISOString(),
      })),
      members: project.members.map((member) => ({
        userId: member.userId,
        role: member.role,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
      })),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error(`GET /api/projects/[slug] error:`, error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}





