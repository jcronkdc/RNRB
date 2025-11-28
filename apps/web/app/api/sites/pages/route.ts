import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';

// GET /api/sites/pages - Get all pages for user's site
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
      include: {
        pages: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { sections: true },
            },
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const pages = site.pages.map((page) => ({
      ...page,
      sectionCount: page._count.sections,
    }));

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('[PAGES] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

// POST /api/sites/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, isVisible = true, order } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug and title are required' }, { status: 400 });
    }

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Check if slug already exists
    const existingPage = await prisma.sitePage.findFirst({
      where: {
        siteId: site.id,
        slug,
      },
    });

    if (existingPage) {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
    }

    // Get the highest order number if not provided
    const lastPage = await prisma.sitePage.findFirst({
      where: { siteId: site.id },
      orderBy: { order: 'desc' },
    });

    const page = await prisma.sitePage.create({
      data: {
        siteId: site.id,
        slug,
        title,
        isHomepage: false,
        isVisible,
        order: order ?? (lastPage ? lastPage.order + 1 : 0),
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error('[PAGES] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

// PATCH /api/sites/pages/:id - Update a page
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('id');

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { slug, title, isVisible, order } = body;

    // Verify ownership
    const page = await prisma.sitePage.findUnique({
      where: { id: pageId },
      include: { site: true },
    });

    if (!page || page.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Don't allow changing homepage slug
    if (page.isHomepage && slug && slug !== page.slug) {
      return NextResponse.json({ error: 'Cannot change homepage slug' }, { status: 400 });
    }

    // Check slug uniqueness if changing
    if (slug && slug !== page.slug) {
      const existingPage = await prisma.sitePage.findFirst({
        where: {
          siteId: page.siteId,
          slug,
          NOT: { id: pageId },
        },
      });

      if (existingPage) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (slug !== undefined) updateData.slug = slug;
    if (title !== undefined) updateData.title = title;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (order !== undefined) updateData.order = order;

    const updatedPage = await prisma.sitePage.update({
      where: { id: pageId },
      data: updateData,
    });

    return NextResponse.json({ page: updatedPage });
  } catch (error) {
    console.error('[PAGES] PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE /api/sites/pages/:id - Delete a page
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('id');

    if (!pageId) {
      return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    // Verify ownership
    const page = await prisma.sitePage.findUnique({
      where: { id: pageId },
      include: { site: true },
    });

    if (!page || page.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Don't allow deleting homepage
    if (page.isHomepage) {
      return NextResponse.json({ error: 'Cannot delete homepage' }, { status: 400 });
    }

    await prisma.sitePage.delete({
      where: { id: pageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PAGES] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
