import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

// POST /api/sites/sections - Add a new section
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, content, styles, order, pageId, animation } = body;

    if (!type) {
      return NextResponse.json({ error: 'Section type is required' }, { status: 400 });
    }

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Get the highest order number for positioning
    const lastSection = await prisma.siteSection.findFirst({
      where: { siteId: site.id, pageId: pageId || null },
      orderBy: { order: 'desc' },
    });

    const section = await prisma.siteSection.create({
      data: {
        siteId: site.id,
        pageId: pageId || null,
        type: type,
        content: content || {},
        styles: styles || null,
        animation: animation || null,
        order: order ?? (lastSection ? lastSection.order + 1 : 0),
        isVisible: true,
      },
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error('[SECTIONS] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}

// PATCH /api/sites/sections - Update a section
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, content, styles, order, isVisible, animation, hideOnMobile, hideOnDesktop } = body;

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    // Verify ownership
    const section = await prisma.siteSection.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!section || section.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (styles !== undefined) updateData.styles = styles;
    if (order !== undefined) updateData.order = order;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (animation !== undefined) updateData.animation = animation;
    if (hideOnMobile !== undefined) updateData.hideOnMobile = hideOnMobile;
    if (hideOnDesktop !== undefined) updateData.hideOnDesktop = hideOnDesktop;

    const updatedSection = await prisma.siteSection.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ section: updatedSection });
  } catch (error) {
    console.error('[SECTIONS] PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

// DELETE /api/sites/sections - Delete a section
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }

    // Verify ownership
    const section = await prisma.siteSection.findUnique({
      where: { id },
      include: { site: true },
    });

    if (!section || section.site.userId !== session.user.id) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    await prisma.siteSection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SECTIONS] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
