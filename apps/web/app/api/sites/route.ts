import { auth } from '@cronkwaters/auth';
import { prisma } from '@cronkwaters/db';
import { type NextRequest, NextResponse } from 'next/server';

import { standardLimiter, strictLimiter, checkRateLimit } from '@/lib/rate-limit';

// GET /api/sites - Get user's site
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 100 requests per minute for reads
    await checkRateLimit(standardLimiter, `sites-read:${session.user.id}`);

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        pages: {
          orderBy: { order: 'asc' },
        },
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ site: null, hasWebsite: false });
    }

    return NextResponse.json({ site, hasWebsite: true });
  } catch (error) {
    console.error('[SITES] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 });
  }
}

// PATCH /api/sites - Update site settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 30 updates per minute for writes
    await checkRateLimit(strictLimiter, `sites-write:${session.user.id}`);

    const body = await request.json();
    const {
      siteName,
      tagline,
      siteTitle,
      metaDescription,
      socialLinks,
      bookingEmail,
      publicEmail,
      templateId,
      theme,
      status,
      customDomain,
      googleAnalyticsId,
      facebookPixelId,
    } = body;

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (siteName !== undefined) updateData.siteName = siteName;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (siteTitle !== undefined) updateData.siteTitle = siteTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (bookingEmail !== undefined) updateData.bookingEmail = bookingEmail;
    if (publicEmail !== undefined) updateData.publicEmail = publicEmail;
    if (templateId !== undefined) updateData.templateId = templateId;
    if (theme !== undefined) updateData.theme = theme;
    if (googleAnalyticsId !== undefined) updateData.googleAnalyticsId = googleAnalyticsId;
    if (facebookPixelId !== undefined) updateData.facebookPixelId = facebookPixelId;

    // Handle status changes
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'published' && !site.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // Handle custom domain (would need verification in production)
    if (customDomain !== undefined) {
      updateData.customDomain = customDomain || null;
      updateData.domainVerified = false; // Requires verification
    }

    const updatedSite = await prisma.musicianSite.update({
      where: { id: site.id },
      data: updateData,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        pages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json({ site: updatedSite });
  } catch (error) {
    console.error('[SITES] PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 });
  }
}

// DELETE /api/sites - Delete site
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 5 deletes per minute (destructive action)
    await checkRateLimit(strictLimiter, `sites-delete:${session.user.id}`);

    const site = await prisma.musicianSite.findUnique({
      where: { userId: session.user.id },
    });

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    await prisma.musicianSite.delete({
      where: { id: site.id },
    });

    return NextResponse.json({ success: true, message: 'Site deleted' });
  } catch (error) {
    console.error('[SITES] DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
  }
}
