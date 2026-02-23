import { type MetadataRoute } from 'next';
import { prisma } from '@cronkwaters/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com').replace(/\/$/, '');
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    { url: `${baseUrl}/features/songwriting`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/features/collaboration`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/features/website-builder`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/features/project-management`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/features/ai-music`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/solutions/bands`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/solutions/studios`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/solutions/songwriters`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/pricing`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/why-rnrb`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/signin`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/discover`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.7 },
  ];

  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const [users, masterclasses] = await Promise.all([
      prisma.user.findMany({
        where: { username: { not: null }, profileCompleted: true },
        select: { username: true, updatedAt: true },
        take: 5000,
      }),
      prisma.masterclass.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),
    ]);

    const userPages: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/u/${user.username}`,
      lastModified: user.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const masterclassPages: MetadataRoute.Sitemap = masterclasses.map((mc) => ({
      url: `${baseUrl}/masterclasses/${mc.slug}`,
      lastModified: mc.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    dynamicPages = [...userPages, ...masterclassPages];
  } catch {
    // DB unavailable during build — return static pages only
  }

  return [...staticPages, ...dynamicPages];
}
