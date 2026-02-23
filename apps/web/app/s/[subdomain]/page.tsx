import { prisma } from '@cronkwaters/db';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { auth } from '@/auth';
import { SiteRenderer } from '@/components/site-builder/SiteRenderer';

interface Props {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ preview?: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;

  const site = await prisma.musicianSite.findUnique({
    where: { subdomain },
    select: {
      siteName: true,
      siteTitle: true,
      metaDescription: true,
      ogImage: true,
    },
  });

  if (!site) {
    return {
      title: 'Site Not Found',
    };
  }

  return {
    title: site.siteTitle || site.siteName || 'Artist Website',
    description: site.metaDescription || undefined,
    openGraph: {
      title: site.siteTitle || site.siteName || 'Artist Website',
      description: site.metaDescription || undefined,
      images: site.ogImage ? [site.ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: site.siteTitle || site.siteName || 'Artist Website',
      description: site.metaDescription || undefined,
      images: site.ogImage ? [site.ogImage] : undefined,
    },
  };
}

export default async function PublicSitePage({ params, searchParams }: Props) {
  const { subdomain } = await params;
  const { preview } = await searchParams;

  // Fetch the site with all sections and user info
  const site = await prisma.musicianSite.findUnique({
    where: { subdomain },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
      pages: {
        orderBy: { order: 'asc' },
      },
      user: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  if (!site) {
    notFound();
  }

  // Allow draft preview for site owners (used by the editor's LivePreview iframe)
  if (site.status !== 'published') {
    if (preview === 'true') {
      const session = await auth();
      if (!session?.user?.id || session.user.id !== site.userId) {
        notFound(); // Not the owner — don't reveal draft
      }
      // Owner previewing their draft — continue rendering
    } else {
      notFound();
    }
  }

  // Track page view (fire and forget)
  trackPageView(site.id).catch(() => {});

  // Transform for renderer
  const siteData = {
    id: site.id,
    siteName: site.siteName,
    subdomain: site.subdomain,
    templateId: site.templateId,
    theme: site.theme as Record<string, unknown> | null,
    socialLinks: site.socialLinks as Record<string, string> | null,
    artistUsername: site.user?.username || null,
    sections: site.sections.map((s) => ({
      id: s.id,
      type: s.type,
      content: s.content as Record<string, unknown>,
      styles: s.styles as Record<string, unknown> | null,
      animation: s.animation,
      isVisible: s.isVisible,
      order: s.order,
    })),
  };

  return <SiteRenderer site={siteData} />;
}

// Track page views for analytics
async function trackPageView(siteId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Increment total views on site
    await prisma.musicianSite.update({
      where: { id: siteId },
      data: { totalViews: { increment: 1 } },
    });

    // Create a SitePageView record (used by analytics dashboard)
    await prisma.sitePageView
      .create({
        data: {
          siteId,
          path: '/',
          visitorId: `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          deviceType: 'desktop', // Would need user-agent parsing for accuracy
        },
      })
      .catch(() => {}); // Non-critical, don't fail the page load

    // Upsert daily analytics
    await prisma.siteAnalytics.upsert({
      where: {
        siteId_date: {
          siteId,
          date: today,
        },
      },
      update: {
        pageViews: { increment: 1 },
        uniqueVisitors: { increment: 1 },
      },
      create: {
        siteId,
        date: today,
        pageViews: 1,
        uniqueVisitors: 1,
      },
    });
  } catch (error) {
    console.error('[SITE-ANALYTICS] Track error:', error);
  }
}
