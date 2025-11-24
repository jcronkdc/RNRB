import type { Metadata, Viewport } from 'next';

import { AblyProvider } from '@/components/ably/ably-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { NavBar } from '@/components/NavBar';
import { PostHogProvider } from '@/components/posthog';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1e1e1e' },
    { media: '(prefers-color-scheme: light)', color: '#1e1e1e' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://cronkwaters.com'),
  title: "Rock N' Roll Basement",
  description:
    "Rock N' Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.",
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
  authors: [{ name: "Rock N' Roll Basement" }],
  creator: "Rock N' Roll Basement",
  publisher: "Rock N' Roll Basement",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Rock N' Roll Basement",
  },
  formatDetection: {
    telephone: false,
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
    title: "Rock N' Roll Basement",
    description:
      "Rock N' Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.",
    siteName: "Rock N' Roll Basement",
    images: [
      {
        url: '/logo-light.png',
        width: 240,
        height: 100,
        alt: "Rock N' Roll Basement logo",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Rock N' Roll Basement",
    description:
      "Rock N' Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.",
    images: ['/logo-light.png'],
  },
  alternates: {
    canonical: 'https://rnrb.ai',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <PostHogProvider>
            <AblyProvider>
              <NavBar />
              {children}
            </AblyProvider>
          </PostHogProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
