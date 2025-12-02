import type { Metadata } from 'next';

import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

// Use Edge Runtime for faster TTFB on marketing pages
// Edge runs closer to users (300+ locations vs ~20 regions)
export const runtime = 'edge';

// Enable dynamic rendering with short revalidation for fresh content
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = generateSEOMetadata({
  title: "Rock N' Roll Basement - Features, Pricing & Solutions for Musicians",
  description:
    "Discover Rock N' Roll Basement features: AI songwriting, real-time collaboration, tour management, website builder, and more. Start free today!",
  keywords: [
    'music platform features',
    'band collaboration tools',
    'music software pricing',
    'songwriting solutions',
  ],
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
