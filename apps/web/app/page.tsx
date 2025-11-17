import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { label: 'GitHub', href: 'https://github.com/jcronkdc/RNRB' },
] as const;

const resourceCards = [
  {
    title: 'Songwriting & projects',
    description:
      'Track songs, projects, and versions with rich metadata so every riff, lyric, and idea has a home.',
    href: '#songs',
  },
  {
    title: 'Tours & live shows',
    description:
      'Plan tours, shows, venues, and setlists so your live world stays in sync with the studio.',
    href: '#touring',
  },
  {
    title: 'Rights & royalties',
    description:
      'Model splits, licenses, and transactions so the money side is as organized as the music.',
    href: '#rights',
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#050816] via-[#061125] to-[#0f172a] text-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] overflow-hidden blur-3xl">
        <div className="mx-auto h-full max-w-5xl bg-[radial-gradient(circle_at_top,_rgba(103,63,255,0.35)_0%,_rgba(12,18,40,0)_60%)]" />
      </div>
      <header className="flex items-center justify-between gap-6 px-6 py-6 sm:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/60">
            <Image
              src="/logo-light.png"
              alt="Rock N' Roll Basement logo"
              width={40}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight">Rock N' Roll Basement</p>
            <p className="text-sm text-gray-400">
              The underground OS for bands, studios, and music organizations.
            </p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-400 transition hover:text-purple-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 pb-24 sm:px-12 lg:px-0">
        <section className="mt-12 space-y-8 text-center">
          <span className="inline-flex items-center gap-2 self-center rounded-full bg-purple-600/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-purple-400">
            Full-stack music ecosystem
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Run your entire music world from the basement.
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-400">
              Rock N' Roll Basement connects projects, songs, tours, rights, and revenue into one
              opinionated workspace so bands, studios, and organizations can stay loud, organized,
              and paid.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="https://github.com/jcronkdc/RNRB"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700"
            >
              View repository<span aria-hidden className="ml-2">→</span>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resourceCards.map((card) => (
            <article
              key={card.title}
              id={card.href.slice(1)}
              className="group rounded-xl border border-white/5 bg-white/5 p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-lg font-semibold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-gray-400">{card.description}</p>
              <Link href={card.href} className="mt-6 inline-block text-sm text-purple-400 hover:underline">
                Explore details
              </Link>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#050816]/70 py-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm text-gray-400 sm:flex-row sm:px-12 lg:px-0">
          <p>
            Built with Next.js 15, Tailwind CSS, Radix UI, NextAuth, Prisma, and tRPC v11.{' '}
            <span className="text-purple-400">Deployed with Turborepo.</span>
          </p>
          <div className="flex items-center gap-4">
            <Link href="mailto:hello@rnrb.ai" className="transition hover:text-purple-400">
              hello@rnrb.ai
            </Link>
            <Link
              href="https://twitter.com/rnrb"
              className="transition hover:text-purple-400"
            >
              @rnrb
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
