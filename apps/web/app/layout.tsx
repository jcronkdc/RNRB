import type { Metadata } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { Fraunces, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import type { ComponentType } from 'react';
import { Providers } from './providers';
import { Background } from '../components/background';
import { PageShell } from '../components/page-shell';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { cn } from '@songforge/ui';
import './globals.css';
import { ThemeProvider } from '../components/theme/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--sf-font-sans'
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--sf-font-serif'
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--sf-font-mono',
  display: 'swap'
});

const AxeInitializer =
  process.env.NODE_ENV === 'production'
    ? (() => null) as ComponentType
    : (dynamic(async () => {
        const { default: React } = await import('react');
        const { default: ReactDOM } = await import('react-dom');
        const axe = (await import('@axe-core/react')).default;
        const { useEffect } = React;

        const AxeComponent: ComponentType = () => {
          useEffect(() => {
            const timeout = setTimeout(() => {
              axe(React, ReactDOM, 1500);
            }, 500);
            return () => clearTimeout(timeout);
          }, []);
          return null;
        };

        return AxeComponent;
      }, { ssr: false }) as unknown as ComponentType);

export const metadata: Metadata = {
  title: 'SongForge',
  description:
    'SongForge is an end-to-end workspace for collaborative songwriting powered by modern web tooling.',
  icons: {
    icon: '/icon.svg'
  }
};

const themeInitializer = `
(function() {
  const storageKey = 'songforge-theme';
  const validThemes = ['light', 'dark', 'warm'];
  try {
    const root = document.documentElement;
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const fallback = prefersDark ? 'dark' : 'light';
    const theme = validThemes.includes(stored) ? stored : fallback;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  } catch (_) {
    // no-op
  }
})();
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={cn(
          inter.variable,
          fraunces.variable,
          geistMono.variable,
          'min-h-screen bg-background text-foreground antialiased transition-colors'
        )}
      >
        <Script id="songforge-theme" strategy="beforeInteractive">
          {themeInitializer}
        </Script>
        <div id="a11y-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
        <ErrorBoundary>
          <Providers>
            <ThemeProvider>
              <AxeInitializer />
              <Background
                className="flex min-h-screen flex-col"
                contentClassName="flex min-h-screen flex-col"
              >
                <NavBar />
                <PageShell>
                  <main
                    id="main-content"
                    className="relative flex-1 px-6 pb-12 pt-6 sm:px-10"
                  >
                    {children}
                  </main>
                </PageShell>
                <Footer />
              </Background>
            </ThemeProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
