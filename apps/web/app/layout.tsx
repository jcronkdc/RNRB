import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { auth } from '@/auth';
import { AblyProvider } from '@/components/ably/ably-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorMonitoringProvider } from '@/components/error-monitoring-provider';
import { InstallAppBanner } from '@/components/install-app-button';
import { NavBar } from '@/components/NavBar';
import { OfflineIndicator } from '@/components/offline-indicator';
import { PWAUpdatePrompt } from '@/components/pwa-update-prompt';
import { PostHogProvider } from '@/components/posthog';
import { KeyboardShortcutsProvider } from '@/components/providers/keyboard-shortcuts-provider';
import { TRPCReactProvider } from '@/components/providers/trpc-provider';
import { SessionProvider } from '@/components/session-provider';
import { ThemeProvider, themeScript } from '@/components/theme';
import { ToastProvider } from '@/hooks/useToast';
import {
  generateMetadata as generateSEOMetadata,
  generateOrganizationSchema,
  generateWebApplicationSchema,
  JsonLd,
} from '@/lib/seo';
import './globals.css';

// PERFORMANCE: Optimized font loading
// Using Inter (variable font) - single file, fast loading, excellent legibility
// Reduces font requests from 4 to 2 (saves ~500ms on FCP)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

// JetBrains Mono for code blocks
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
  preload: false, // Not critical for initial paint
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
};

export const metadata: Metadata = generateSEOMetadata({
  title: "Rock N' Roll Basement - Music Collaboration Platform for Bands & Studios",
  description:
    'The all-in-one music collaboration platform trusted by musicians worldwide. AI-powered songwriting, real-time collaboration, tour management, copyright tools, and more. Start free today.',
  keywords: [
    'music collaboration software',
    'online band management',
    'songwriter collaboration tools',
    'AI music assistant',
    'real-time music editing',
  ],
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme script - must run before React to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* PERFORMANCE: DNS Prefetch for third-party origins */}
        <link rel="dns-prefetch" href="https://us.i.posthog.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://realtime.ably.io" />

        {/* Favicon & Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* iOS PWA Settings */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RNR Basement" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* iOS Splash Screens - iPhone */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-14-pro-max.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-14-pro.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-12-pro-max.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-12-pro.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-x.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-xs-max.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-xr.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-8-plus.png"
          media="(device-width: 360px) and (device-height: 640px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-8.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone-se.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />

        {/* iOS Splash Screens - iPad */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-pro-12.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-pro-11.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-pro-10.png"
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-10.png"
          media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-9.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-mini-6.png"
          media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2)"
        />

        {/* Structured Data */}
        <JsonLd data={[generateOrganizationSchema(), generateWebApplicationSchema()]} />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <SessionProvider session={session}>
            <ThemeProvider defaultTheme="dark">
              <ErrorMonitoringProvider>
                <TRPCReactProvider>
                  <PostHogProvider>
                    <AblyProvider>
                      <KeyboardShortcutsProvider>
                        <ToastProvider>
                          <a
                            href="#main-content"
                            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-white"
                          >
                            Skip to main content
                          </a>
                          <OfflineIndicator />
                          <PWAUpdatePrompt />
                          <NavBar />
                          <main id="main-content">{children}</main>
                          <InstallAppBanner />
                        </ToastProvider>
                      </KeyboardShortcutsProvider>
                    </AblyProvider>
                  </PostHogProvider>
                </TRPCReactProvider>
              </ErrorMonitoringProvider>
            </ThemeProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
