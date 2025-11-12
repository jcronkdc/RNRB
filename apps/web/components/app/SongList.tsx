'use client';

import { Button, cn } from '@songforge/ui';
import { Music } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import AssetList, { type AssetListItem } from './AssetList';
import { EmptyState } from './EmptyState';
import LicenseList, { type LicenseListItem } from './LicenseList';
import NewLicenseDialog from './NewLicenseDialog';
import NewSongDialog from './NewSongDialog';
import NewSplitDialog from './NewSplitDialog';
import PageHeader from './PageHeader';
import ProjectBadge, { type ProjectVisibility } from './ProjectBadge';
import SplitList, { type SplitListItem } from './SplitList';

export interface SongListItem {
  id: string;
  title: string;
  key?: string;
  tempo?: number;
}

export default function SongList({ items, onCreate }: { items: SongListItem[]; onCreate?: () => void }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<Music className="h-6 w-6" aria-hidden="true" />}
        title="Start Your First Song"
        description="Every great project begins with a single track. Log your first song to begin tracking progress, collaborators, and the journey from idea to release."
        action={onCreate ? { label: 'Add Song', onClick: onCreate } : undefined}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface/80 shadow-soft">
      <div className="grid grid-cols-[3fr_1fr_1fr] items-center border-b border-border/50 px-5 py-3 text-xs uppercase tracking-[0.28em] text-brand-muted-foreground">
        <span>Title</span>
        <span>Key</span>
        <span>Tempo</span>
      </div>
      <ul>
        {items.map((song) => (
          <li key={song.id}>
            <button
              type="button"
              className={cn(
                'grid w-full grid-cols-[3fr_1fr_1fr] items-center gap-2 px-5 py-4 text-left text-sm transition hover:bg-brand-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary'
              )}
              aria-label={`Open song ${song.title}`}
            >
              <span className="truncate font-medium text-brand-foreground">{song.title}</span>
              <span className="text-xs text-muted-foreground">{song.key ?? '—'}</span>
              <span className="text-xs text-muted-foreground">{song.tempo ? `${song.tempo} BPM` : '—'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'songs', label: 'Songs' },
  { id: 'assets', label: 'Assets' },
  { id: 'splits', label: 'Splits' },
  { id: 'licenses', label: 'Licenses' }
] as const;

type TabId = (typeof TABS)[number]['id'];

interface ProjectDetailClientProps {
  project: {
    name: string;
    visibility: ProjectVisibility;
    createdAt: string;
    description: string;
  };
  initialSongs: SongListItem[];
  initialAssets: AssetListItem[];
  initialSplits: SplitListItem[];
  initialLicenses: LicenseListItem[];
  onCreateSong?: (song: { title: string; key?: string; tempo?: number }) => void | Promise<void>;
  onCreateSplit?: (split: { title: string; contributors: Array<{ name: string; pct: number; role?: string }> }) => void | Promise<void>;
  onCreateLicense?: (license: { template: string; title: string; notes?: string }) => void | Promise<void>;
}

export function ProjectDetailClient({ project, initialSongs, initialAssets, initialSplits, initialLicenses, onCreateSong, onCreateSplit, onCreateLicense }: ProjectDetailClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  function validTab(tab: string): TabId {
    return (TABS.find(t => t.id === tab) ? tab : 'overview') as TabId;
  }
  // Read tab from search param. If missing, default to overview.
  const paramTab = searchParams.get('tab');
  const currentTab = validTab(paramTab || 'overview');
  const [activeTab, setActiveTab] = useState<TabId>(currentTab);

  // Keep activeTab in sync with URL/searchParam
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) {
      // Only update URL if we're not already on overview to avoid loops
      if (activeTab !== 'overview') {
        router.replace(`?tab=overview`, { scroll: false });
      }
    } else {
      const valid = validTab(tab);
      if (valid !== activeTab) {
        setActiveTab(valid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const changeTab = (next: TabId) => {
    router.replace(`?tab=${next}`, { scroll: false });
  };

  const [songs, setSongs] = useState<SongListItem[]>(initialSongs);
  const [assets] = useState<AssetListItem[]>(initialAssets);
  const [splits, setSplits] = useState<SplitListItem[]>(initialSplits);
  const [licenses, setLicenses] = useState<LicenseListItem[]>(initialLicenses);
  const [songDialogOpen, setSongDialogOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'songs') {
      const songListener = () => setSongDialogOpen(true);
      window.addEventListener('ui:new-song', songListener as EventListener);
      return () => window.removeEventListener('ui:new-song', songListener as EventListener);
    }
    if (activeTab === 'splits') {
      const splitListener = () => setSplitDialogOpen(true);
      window.addEventListener('ui:new-split', splitListener as EventListener);
      return () => window.removeEventListener('ui:new-split', splitListener as EventListener);
    }
  }, [activeTab]);

  const createdLabel = useMemo(
    () => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(project.createdAt)),
    [project.createdAt]
  );

  return (
    <div className="space-y-10">
      <PageHeader
        title={project.name}
        subtitle="Project overview"
        actions={(() => {
          switch (activeTab) {
            case 'songs':
              return <Button onClick={() => setSongDialogOpen(true)}>New Song</Button>;
            case 'assets':
              return (
                <Button asChild>
                  <a href="/app/assets">Open Assets</a>
                </Button>
              );
            case 'splits':
              return <Button onClick={() => setSplitDialogOpen(true)}>New Split</Button>;
            case 'licenses':
              return <Button onClick={() => setLicenseDialogOpen(true)}>New License</Button>;
            default:
              return <Button onClick={() => setSongDialogOpen(true)}>New Item</Button>;
          }
        })()}
      />

      <nav aria-label="Project sections" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => changeTab(tab.id)}
            aria-current={tab.id === activeTab ? 'page' : undefined}
            className="rounded-full border border-border/60 bg-surface px-4 py-2 text-sm text-muted-foreground transition hover:text-brand-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' ? (
        <section className="space-y-8 rounded-3xl border border-border/60 bg-surface/80 px-6 py-10 shadow-soft">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <ProjectBadge visibility={project.visibility} />
            <span>
              <span className="font-medium text-brand-foreground">Created:</span> {createdLabel}
            </span>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">{project.description}</p>
        </section>
      ) : null}

      {activeTab === 'songs' ? <SongList items={songs} onCreate={() => setSongDialogOpen(true)} /> : null}

      {activeTab === 'assets' ? (
        <AssetList
          items={assets}
          onCreate={() => router.push('/app/assets')}
        />
      ) : null}

      {activeTab === 'splits' ? <SplitList items={splits} onCreate={() => setSplitDialogOpen(true)} /> : null}

      {activeTab === 'licenses' ? <LicenseList items={licenses} onCreate={() => setLicenseDialogOpen(true)} /> : null}

      {activeTab !== 'overview' && activeTab !== 'songs' && activeTab !== 'assets' && activeTab !== 'splits' && activeTab !== 'licenses' ? (
        <section className="rounded-3xl border border-dashed border-border/60 bg-surface/70 px-6 py-12 text-center text-sm text-muted-foreground">
          Additional tooling is on the roadmap.
        </section>
      ) : null}

      <NewSongDialog
        open={songDialogOpen}
        onOpenChange={setSongDialogOpen}
        onCreate={async (song) => {
          if (onCreateSong) {
            await onCreateSong(song);
            router.refresh();
          } else {
            setSongs((prev) => [...prev, { ...song, id: `temp-${Date.now()}` }]);
          }
        }}
      />

      <NewSplitDialog
        open={splitDialogOpen}
        onOpenChange={setSplitDialogOpen}
        onCreate={async (split) => {
          if (onCreateSplit) {
            await onCreateSplit({ title: split.title, contributors: split.contributors });
            router.refresh();
          } else {
            const totalPct = split.contributors.reduce((acc, contributor) => acc + contributor.pct, 0);
            setSplits((prev) => [...prev, { id: split.id, title: split.title, totalPct, contributors: split.contributors }]);
          }
        }}
      />

      <NewLicenseDialog
        open={licenseDialogOpen}
        onOpenChange={setLicenseDialogOpen}
        onCreate={async (license) => {
          if (onCreateLicense) {
            await onCreateLicense(license);
            router.refresh();
          } else {
            setLicenses((prev) => [...prev, { ...license, createdAt: new Date().toISOString() }]);
          }
        }}
      />
    </div>
  );
}
