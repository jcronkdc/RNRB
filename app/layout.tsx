import type { Metadata } from 'next';
import { AblyProvider } from '@/components/ably';
import { NavBar } from '@/components/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rock N' Roll Basement',
  description:
    'Rock N' Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.',
  keywords: [
    'rock',
    'bands',
    'songwriting',
    'music production',
    'touring',
    'rights management',
    'royalties',
    'studios',
  ],
  authors: [{ name: 'Rock N' Roll Basement' }],
  creator: 'Rock N' Roll Basement',
  publisher: 'Rock N' Roll Basement',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rnrb.ai',
    title: 'Rock N' Roll Basement',
    description:
      'Rock N' Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.',
    siteName: 'Rock N' Roll Basement',
    images: [
      {
        url: '/logo-light.png',
        width: 240,
        height: 100,
        alt: 'Rock N' Roll Basement logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rock N' Roll Basement',
    description:
      'Rock N' Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.',
    images: ['/logo-light.png'],
  },
  alternates: {
    canonical: 'https://rnrb.ai',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AblyProvider>
          <NavBar />
          {children}
        </AblyProvider>
      </body>
    </html>
  );
}

