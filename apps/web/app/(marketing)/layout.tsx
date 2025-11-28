import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

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
