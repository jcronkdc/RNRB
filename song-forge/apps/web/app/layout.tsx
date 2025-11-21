import { cn } from "@cronkwaters/ui";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import Script from "next/script";
import { Suspense } from "react";

import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "./sw-register";
import { Background } from "../components/background";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { NavBar } from "../components/NavBar";
import { PageShell } from "../components/page-shell";
import { WebVitals } from "../components/web-vitals";
import "./globals.css";

// Lazy load non-critical components
const Footer = dynamic(() => import("../components/Footer").then((mod) => ({ default: mod.Footer })), {
  ssr: true,
});
const AxeInitializer = dynamic(() => import("../components/AxeInitializer").then((mod) => ({ default: mod.AxeInitializer })), {
  ssr: false,
});

// Optimize font loading - Next.js automatically preloads fonts with display: "swap"
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--sf-font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--sf-font-serif",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--sf-font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rock N' Roll Basement",
  description:
    "Where musicians create, collaborate, and change the industry. The underground HQ for artists from amateur to pro.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cronkwaters.com'),
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: 'website',
    siteName: 'Rock N\' Roll Basement',
    title: 'Rock N\' Roll Basement - Underground HQ for Musicians',
    description: 'Where musicians create, collaborate, and change the industry. The underground HQ for artists from amateur to pro.',
    images: [{
      url: '/og-default.jpg',
      width: 1200,
      height: 630,
      alt: 'Rock N\' Roll Basement'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@rnrbasement',
    creator: '@rnrbasement',
    title: 'Rock N\' Roll Basement',
    description: 'Where musicians create, collaborate, and change the industry.',
    images: ['/og-default.jpg'],
  },
  keywords: ['music collaboration', 'songwriting', 'music production', 'band management', 'music industry', 'rock n roll'],
};

// Minified, optimized theme initializer - executes before page paint
const themeInitializer = `!function(){try{const t=document.documentElement,e=localStorage.getItem('rnrb-theme'),r=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',n=['light','dark','warm'].includes(e)?e:r;t.setAttribute('data-theme',n),t.style.colorScheme='dark'===n?'dark':'light'}catch(t){}}();`;

 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch & Preconnect for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical assets */}
        <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preload critical images */}
        <link rel="preload" href="/rnrlight.png" as="image" type="image/png" fetchPriority="high" />
        
        {/* PWA Configuration */}
        <meta name="theme-color" content="#8b5cf6" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#6d28d9" media="(prefers-color-scheme: dark)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
        />
      </head>
      <body
        className={cn(
          inter.variable,
          fraunces.variable,
          geistMono.variable,
          "bg-background text-foreground min-h-screen antialiased transition-colors",
        )}
      >
        {/* Inline critical theme script - executes before first paint */}
        <Script
          id="rnrb-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitializer }}
        />
        
        {/* Service Worker - non-blocking */}
        <ServiceWorkerRegistration />
        
        {/* Accessibility announcer */}
        <div id="a11y-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
        
        <ErrorBoundary>
          <Providers>
            {/* Web Vitals monitoring - zero overhead, reports only */}
            <WebVitals />
            
            {/* Development-only accessibility testing - lazy loaded */}
            {process.env.NODE_ENV === "development" && (
              <Suspense fallback={null}>
                <AxeInitializer />
              </Suspense>
            )}
            
            <Background
              className="flex min-h-screen flex-col"
              contentClassName="flex min-h-screen flex-col"
            >
              {/* Critical above-fold content */}
              <NavBar />
              
              <PageShell>
                <main id="main-content" className="relative flex-1 px-6 pb-12 pt-6 sm:px-10">
                  {children}
                </main>
              </PageShell>
              
              {/* Below-fold footer - lazy loaded with Suspense */}
              <Suspense fallback={<div className="h-24" />}>
                <Footer />
              </Suspense>
            </Background>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
