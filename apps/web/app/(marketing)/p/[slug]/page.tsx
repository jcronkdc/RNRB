import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@songforge/ui';
import CreditList from '../../../../components/marketing/CreditList';

const MOCK_PROJECTS = {
  aurora: {
    name: 'Aurora Lines',
    tagline: 'A shimmering electro-pop journey inspired by arctic light.',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    credits: [
      { name: 'SongForge Collective', role: 'Writers', pct: 60 },
      { name: 'Mae Rivera', role: 'Producer', pct: 40 },
      { name: 'Atlas Mastering', role: 'Mastering Engineer' }
    ]
  },
  midnight: {
    name: 'Midnight Demo Sessions',
    tagline: 'Late-night sketches, raw vocals, and ambient experiments.',
    coverImage: 'https://images.unsplash.com/photo-1498059542312-f47dc8e52a47?auto=format&fit=crop&w=1200&q=80',
    credits: [
      { name: 'Nocturne', role: 'Writer/Producer', pct: 70 },
      { name: 'Celia Harper', role: 'Vocalist', pct: 30 }
    ]
  },
  publicreel: {
    name: 'Public Reel 2025',
    tagline: 'A curated sampler of live takes and community collaborations.',
    coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
    credits: [
      { name: 'SongForge House Band', role: 'Performers' },
      { name: 'Open Scores Initiative', role: 'Arrangements' }
    ]
  }
} as const;

type ProjectSlug = keyof typeof MOCK_PROJECTS;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const url = `/p/${params.slug}/opengraph-image`;
  const project = MOCK_PROJECTS[params.slug as keyof typeof MOCK_PROJECTS];
  return {
    openGraph: {
      images: [url],
      title: project?.name || 'Song Forge Project',
      description: project?.tagline || 'A Song Forge release.'
    }
  };
}

export default function PublicProjectPage({ params }: { params: { slug: string } }) {
  const project = MOCK_PROJECTS[params.slug as ProjectSlug];

  if (!project) {
    notFound();
  }

  return (
    <main id="main-content" className="bg-background">
      <section className="motion-safe:animate-fade-in mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col gap-12 px-6 py-20">
        <header className="grid gap-8 md:grid-cols-[280px,1fr] md:items-center">
          <div className="relative h-64 w-full overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-soft">
            <div
              role="img"
              aria-label={`${project.name} cover art placeholder`}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${project.coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background/60 to-transparent" aria-hidden="true" />
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-brand-muted-foreground">SongForge Project</p>
              <h1 className="mt-3 text-4xl font-semibold text-brand-foreground">{project.name}</h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{project.tagline}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button">Request Access</Button>
              <Button variant="ghost" asChild>
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </header>

        <section aria-labelledby="project-credits" className="rounded-3xl border border-border/60 bg-surface/80 px-6 py-10 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="project-credits" className="text-2xl font-semibold text-brand-foreground">
                Credits
              </h2>
              <p className="text-sm text-muted-foreground">Key collaborators across writing, production, and performance.</p>
            </div>
          </div>
          <div className="mt-6">
            <CreditList items={project.credits} />
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-surface/80 px-6 py-10 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-brand-foreground">Support this project</h2>
              <p className="text-sm text-muted-foreground">
                Exclusive previews, live session invites, and behind-the-scenes drops are coming soon.
              </p>
            </div>
            <Button type="button">Support this project</Button>
          </div>
        </section>
      </section>
    </main>
  );
}
