import type { Metadata, Viewport } from 'next';
import { DM_Sans, JetBrains_Mono, Instrument_Serif } from 'next/font/google';

import { auth } from '@/auth';
import { AblyProvider } from '@/components/ably/ably-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { NavBar } from '@/components/NavBar';
import { PostHogProvider } from '@/components/posthog';
import { KeyboardShortcutsProvider } from '@/components/providers/keyboard-shortcuts-provider';
import { TRPCReactProvider } from '@/components/providers/trpc-provider';
import { SessionProvider } from '@/components/session-provider';
import { ToastProvider } from '@/hooks/useToast';
import {
  generateMetadata as generateSEOMetadata,
  generateOrganizationSchema,
  generateWebApplicationSchema,
  JsonLd,
} from '@/lib/seo';
import './globals.css';

// Typography - Custom, distinctive, not generic
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <JsonLd data={[generateOrganizationSchema(), generateWebApplicationSchema()]} />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <SessionProvider session={session}>
            <TRPCReactProvider>
              <PostHogProvider>
                <AblyProvider>
                  <KeyboardShortcutsProvider>
                    <ToastProvider>
                      <NavBar />
                      {children}
                    </ToastProvider>
                  </KeyboardShortcutsProvider>
                </AblyProvider>
              </PostHogProvider>
            </TRPCReactProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
