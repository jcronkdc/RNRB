import Link from 'next/link';

import { HeroLogo, FooterLogo } from './components/landing-logos';

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#1c1915]">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-12 sm:py-8">
        <HeroLogo />
        <div className="flex items-center gap-4">
          <Link
            href="/auth"
            className="text-sm font-medium text-[#9b9488] transition-colors hover:text-[#f5f0e8]"
          >
            Sign in
          </Link>
          <Link
            href="/auth?signup=true"
            className="rounded-xl bg-[#e85d3b] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#f47254]"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          {/* The one line */}
          <h1 className="mb-6 text-4xl font-light leading-tight tracking-tight text-[#f5f0e8] sm:text-5xl md:text-6xl">
            Write songs together,{' '}
            <span className="text-[#e85d3b]">like you&apos;re in the same room</span>
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-[#9b9488]">
            A quiet place for songwriters and musicians to create,
            collaborate, and build something real — together.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth?signup=true"
              className="rounded-xl bg-[#e85d3b] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[#f47254] hover:shadow-lg hover:shadow-[#e85d3b]/20"
            >
              Start writing — it&apos;s free
            </Link>
            <Link
              href="/auth"
              className="rounded-xl px-8 py-3.5 text-base font-medium text-[#9b9488] transition-colors hover:text-[#f5f0e8]"
            >
              I have an account
            </Link>
          </div>
        </div>
      </main>

      {/* What it is — three quiet truths */}
      <section className="px-6 pb-24 pt-12 sm:px-12">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="text-center sm:text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2a2620]">
              <svg className="h-5 w-5 text-[#e85d3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-medium text-[#f5f0e8]">Write</h3>
            <p className="text-sm leading-relaxed text-[#9b9488]">
              Lyrics, chords, structure. Version control for every idea.
              AI that assists without replacing your voice.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2a2620]">
              <svg className="h-5 w-5 text-[#d4a84b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-medium text-[#f5f0e8]">Collaborate</h3>
            <p className="text-sm leading-relaxed text-[#9b9488]">
              Send a song like handing someone a piece of paper.
              See each other&apos;s edits live. Jump on a call in one click.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2a2620]">
              <svg className="h-5 w-5 text-[#7b9178]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-medium text-[#f5f0e8]">Own it</h3>
            <p className="text-sm leading-relaxed text-[#9b9488]">
              Your music is yours. Always. Export anytime.
              No lock-in. No rights grabs. Ever.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8 sm:px-12"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
          <FooterLogo />
          <p className="text-xs text-[#9b9488]">
            &copy; {new Date().getFullYear()} Rock N&apos; Roll Basement. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
