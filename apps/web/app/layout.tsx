import type { Metadata } from 'next';
import { AblyProvider } from '@/components/ably';
import { Bebas_Neue, Oswald, Inter, JetBrains_Mono, Rock_Salt, Permanent_Marker } from 'next/font/google';
import './globals.css';

// Bold display font for headlines - perfect for music/rock aesthetic
const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

// Strong, impactful font for navigation and subtitles
const oswald = Oswald({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-oswald',
});

// Clean sans-serif for body text
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Monospace for code/technical elements
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// Handwritten rock style for main branding
const rockSalt = Rock_Salt({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rock',
});

// Bold marker style for headings
const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-marker',
});

export const metadata: Metadata = {
  title: 'Rock N’ Roll Basement',
  description:
    'Rock N’ Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.',
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
  authors: [{ name: 'Rock N’ Roll Basement' }],
  creator: 'Rock N’ Roll Basement',
  publisher: 'Rock N’ Roll Basement',
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
    title: 'Rock N’ Roll Basement',
    description:
      'Rock N’ Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.',
    siteName: 'Rock N’ Roll Basement',
    images: [
      {
        url: '/logo-light.png',
        width: 240,
        height: 100,
        alt: 'Rock N’ Roll Basement logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rock N’ Roll Basement',
    description:
      'Rock N’ Roll Basement is a full-stack music workspace for bands, studios, and organizations to manage songs, tours, rights, and revenue in one place.',
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
      <body className={`${bebasNeue.variable} ${oswald.variable} ${inter.variable} ${jetbrainsMono.variable} ${rockSalt.variable} ${permanentMarker.variable} font-sans bg-background text-foreground`}>
        <AblyProvider>
          {children}
        </AblyProvider>
      </body>
    </html>
  );
}

