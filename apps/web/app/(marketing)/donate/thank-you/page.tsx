import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: "Thank You For Your Donation | Rock N' Roll Basement",
  description:
    'Thank you for supporting the Kids Instruments Fund. Your generosity will help put musical instruments in the hands of children who dream of making music.',
});

export default function ThankYouPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="container flex min-h-screen flex-col items-center justify-center px-4 py-20">
        {/* Logo */}
        <Link href="/" className="group mb-12 inline-block">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={160}
            height={64}
            priority
            className="transition-opacity duration-200 group-hover:opacity-80"
          />
        </Link>

        {/* Success Animation */}
        <div
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background:
              'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 100%)',
            border: '2px solid rgba(34, 197, 94, 0.5)',
          }}
        >
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#22c55e"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1
          className="mb-4 text-center text-4xl font-bold md:text-5xl"
          style={{ fontFamily: 'Oswald, sans-serif' }}
        >
          Thank You!
        </h1>

        <p className="mb-8 max-w-lg text-center text-lg" style={{ color: 'var(--muted)' }}>
          Your generosity is incredible. Because of you, a child will experience the joy of making
          music for the first time.
        </p>

        {/* Impact Card */}
        <div
          className="mb-10 w-full max-w-md rounded-xl p-6 text-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="mb-4 text-sm font-medium tracking-wider uppercase"
            style={{ color: 'var(--muted)' }}
          >
            What Happens Next
          </div>
          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
              >
                1
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                You'll receive a confirmation email with your tax-deductible receipt
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
              >
                2
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                We'll match your donation to a child or school in need
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
              >
                3
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                You'll get an update when your donation makes an impact
              </span>
            </li>
          </ul>
        </div>

        {/* Share Section */}
        <div className="mb-10 text-center">
          <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>
            Help us spread the word
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://twitter.com/intent/tweet?text=I%20just%20donated%20to%20help%20put%20musical%20instruments%20in%20the%20hands%20of%20kids%20in%20need%20through%20%40RockNRollBsmnt!%20Join%20me%3A&url=https://cronkwaters.com/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              aria-label="Share on Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://cronkwaters.com/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              aria-label="Share on Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/shareArticle?mini=true&url=https://cronkwaters.com/donate&title=Kids%20Instruments%20Fund"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              aria-label="Share on LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/donate"
            className="rounded-lg px-6 py-2.5 text-sm font-semibold tracking-wider uppercase transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              color: 'white',
            }}
          >
            Donate Again
          </Link>
          <Link
            href="/"
            className="rounded-lg px-6 py-2.5 text-sm font-semibold tracking-wider uppercase transition-all hover:opacity-90"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
