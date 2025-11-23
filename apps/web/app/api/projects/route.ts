import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Get user from Supabase auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract user ID from token (Supabase format)
    // For now, we'll use a simpler approach - get from cookie
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get all projects where user is a member
    const projects = await db.project.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
          },
        },
        songs: {
          select: {
            id: true,
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform to match frontend expectations
    const transformedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      tagline: project.tagline,
      cover_image: project.coverImage,
      visibility: project.visibility,
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
      song_count: project._count.songs,
      collaborator_count: project._count.members,
      session_count: project._count.studioSessions,
    }));

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, orgId, name, description, tagline, visibility, coverImage, genre, targetReleaseDate } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingProject = await db.project.findUnique({
      where: { slug },
    });

    if (existingProject) {
      // Add timestamp to make it unique
      const uniqueSlug = `${slug}-${Date.now()}`;
      return await createProject(uniqueSlug);
    }

    return await createProject(slug);

    async function createProject(finalSlug: string) {
      // If no orgId provided, create or get user's personal org
      let finalOrgId = orgId;
      
      if (!finalOrgId) {
        // Try to find user's personal org
        const user = await db.user.findUnique({
          where: { id: userId },
          include: {
            memberships: {
              where: {
                role: 'owner',
              },
              include: {
                org: true,
              },
            },
          },
        });

        if (user?.memberships && user.memberships.length > 0) {
          finalOrgId = user.memberships[0].org.id;
        } else {
          // Create a personal org for the user
          const personalOrg = await db.org.create({
            data: {
              name: `${user?.name || 'My'} Workspace`,
              slug: `${userId}-workspace-${Date.now()}`,
              type: 'solo',
            },
          });

          // Add user as owner
          await db.membership.create({
            data: {
              userId: userId,
              orgId: personalOrg.id,
              role: 'owner',
            },
          });

          finalOrgId = personalOrg.id;
        }
      }

      // Create the project
      const project = await db.project.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          description: description?.trim() || null,
          tagline: tagline?.trim() || null,
          coverImage: coverImage || null,
          visibility: visibility || 'private',
          orgId: finalOrgId,
        },
        include: {
          _count: {
            select: {
              songs: true,
              members: true,
              studioSessions: true,
            },
          },
        },
      });

      // Add creator as owner
      await db.projectMember.create({
        data: {
          projectId: project.id,
          userId: userId,
          role: 'owner',
        },
      });

      // Transform response
      const response = {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        tagline: project.tagline,
        cover_image: project.coverImage,
        visibility: project.visibility,
        created_at: project.createdAt.toISOString(),
        updated_at: project.updatedAt.toISOString(),
        song_count: project._count.songs,
        collaborator_count: project._count.members + 1, // +1 for creator
        session_count: project._count.studioSessions,
      };

      return NextResponse.json(response, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

