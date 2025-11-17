import type { Metadata } from 'next';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const ogImage = '/og-default.jpg';

const metadata: Metadata = {
  title: {
    default: 'Rock N\' Roll Basement',
    template: '%s • Rock N\' Roll Basement',
  },
  description: 'Where musicians create, collaborate, and change the industry. The underground HQ for artists from amateur to pro.',
  metadataBase: new URL(base),
  openGraph: {
    type: 'website',
    siteName: 'Rock N\' Roll Basement',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@rnrbasement',
    images: [ogImage],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export default metadata;
