import type { MetadataRoute } from 'next';

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const ROUTES = [
  {
    path: '/',
    priority: 1,
    changeFrequency: 'weekly'
  },
  {
    path: '/donate',
    priority: 0.8,
    changeFrequency: 'weekly'
  },
  {
    // Placeholder public project route. TODO: replace with dynamic project list once backend available.
    path: '/p/example-project',
    priority: 0.7,
    changeFrequency: 'weekly'
  }
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    changeFrequency: route.changeFrequency,
    lastModified,
    priority: route.priority
  }));
}
