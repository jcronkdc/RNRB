import { prisma } from '@cronkwaters/db';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { checkRateLimit, strictLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 org creations per minute
    try {
      await checkRateLimit(strictLimiter, `org-create:${session.user.id}`);
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before creating another organization.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, type, description } = body;

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Organization name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['band', 'solo', 'studio', 'foundation'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Organization type must be one of: band, solo, studio, foundation' },
        { status: 400 }
      );
    }

    // Validate description
    const trimmedDescription = description?.trim() || null;
    if (trimmedDescription && trimmedDescription.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure slug uniqueness
    const existingOrg = await prisma.org.findUnique({
      where: { slug: baseSlug },
    });

    const finalSlug = existingOrg ? `${baseSlug}-${Date.now()}` : baseSlug;

    // Create org + owner membership in a transaction
    const org = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.org.create({
        data: {
          name: trimmedName,
          slug: finalSlug,
          type: type as 'band' | 'solo' | 'studio' | 'foundation',
          description: trimmedDescription,
        },
      });

      await tx.membership.create({
        data: {
          userId: session.user!.id!,
          orgId: newOrg.id,
          role: 'owner',
        },
      });

      return newOrg;
    });

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        type: org.type,
        description: org.description,
      },
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            description: true,
            brandColor: true,
            _count: {
              select: {
                memberships: true,
                projects: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      organizations: memberships.map((m) => ({
        ...m.org,
        role: m.role,
        memberCount: m.org._count.memberships,
        projectCount: m.org._count.projects,
      })),
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}
