import type { MetadataRoute } from 'next';
import { prisma } from '@cronkwaters/db';

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const STATIC_ROUTES = [
  {
    path: '/',
    priority: 1,
    changeFrequency: 'weekly' as const
  },
  {
    path: '/donate',
    priority: 0.8,
    changeFrequency: 'weekly' as const
  },
  {
    path: '/privacy',
    priority: 0.5,
    changeFrequency: 'monthly' as const
  },
  {
    path: '/terms',
    priority: 0.5,
    changeFrequency: 'monthly' as const
  }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Get static routes
  const staticRoutes = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    changeFrequency: route.changeFrequency,
    lastModified,
    priority: route.priority
  }));

  // Get public projects dynamically
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicProjects = await prisma.project.findMany({
      where: {
        visibility: 'public',
        status: 'active'
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50 // Limit to top 50 projects for sitemap
    });

    projectRoutes = publicProjects.map((project) => ({
      url: `${base}/p/${project.slug}`,
      changeFrequency: 'weekly' as const,
      lastModified: project.updatedAt,
      priority: 0.7
    }));
  } catch (error) {
    // If database is unavailable, just return static routes
    console.error('Failed to fetch public projects for sitemap:', error);
  }

  // Get public artist pages (if any)
  let artistRoutes: MetadataRoute.Sitemap = [];
  try {
    const publicArtists = await prisma.org.findMany({
      where: {
        type: {
          in: ['foundation', 'studio', 'band'] // Filter org types
        }
        // Add visibility check when org profiles have public option
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 25 // Limit to top 25 organizations
    });

    // TODO: When artist profiles are implemented, add routes for public artists
    artistRoutes = publicArtists.map((org) => ({
      url: `${base}/org/${org.slug}`,
      changeFrequency: 'monthly' as const,
      lastModified: org.updatedAt,
      priority: 0.6
    }));
  } catch (error) {
    console.error('Failed to fetch public artists for sitemap:', error);
  }

  return [...staticRoutes, ...projectRoutes, ...artistRoutes];
}
