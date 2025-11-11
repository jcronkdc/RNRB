import type { Metadata } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const ogImage = '/og-default.jpg';

const metadata: Metadata = {
  title: {
    default: 'Song Forge',
    template: '%s • Song Forge',
  },
  description: 'A beautiful, collaborative ecosystem for songwriting, recording, and community.',
  metadataBase: new URL(base),
  openGraph: {
    type: 'website',
    siteName: 'Song Forge',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@songforge',
    images: [ogImage],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default metadata;
