import { cn } from "@cronkwaters/ui";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";

import { Providers } from "./providers";
import { ServiceWorkerRegistration } from "./sw-register";
import { AxeInitializer } from "../components/AxeInitializer";
import { Background } from "../components/background";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { PageShell } from "../components/page-shell";
import "./globals.css";

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
    "Rock N' Roll Basement is an end-to-end workspace for collaborative songwriting powered by modern web tooling.",
  icons: {
    icon: "/icon.svg",
  },
};

const themeInitializer = `
(function() {
  const storageKey = 'rnrb-theme';
  const validThemes = ['light', 'dark', 'warm'];
  try {
    const root = document.documentElement;
    const stored = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const fallback = prefersDark ? 'dark' : 'light';
    const theme = validThemes.includes(stored) ? stored : fallback;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = (theme === 'dark') ? 'dark' : 'light';
  } catch (_) {
    // no-op
  }
})();
`;

 
export default function RootLayout({
  children,
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
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
        <Script
          id="rnrb-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitializer }}
        />
        <ServiceWorkerRegistration />
        <div id="a11y-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
        <ErrorBoundary>
          <Providers>
            {process.env.NODE_ENV === "development" ? <AxeInitializer /> : null}
            <Background
              className="flex min-h-screen flex-col"
              contentClassName="flex min-h-screen flex-col"
            >
              <NavBar />
              <PageShell>
                <main id="main-content" className="relative flex-1 px-6 pb-12 pt-6 sm:px-10">
                  {children}
                </main>
              </PageShell>
              <Footer />
            </Background>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
