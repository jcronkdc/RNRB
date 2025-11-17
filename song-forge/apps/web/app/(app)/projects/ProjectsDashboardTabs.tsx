'use client';

import { Music, FolderOpen } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SongList } from './SongList';
import ProjectList from '../../../components/app/ProjectList';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FolderOpen },
  { id: 'songs', label: 'Songs', icon: Music },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface ProjectsDashboardTabsProps {
  projects: Array<{
    id: string;
    name: string;
    slug: string;
    visibility: 'private' | 'org' | 'public';
    createdAt: string;
  }>;
  songs: Array<{
    id: string;
    project_id: string;
    title: string;
    bpm?: number;
    key?: string;
    mood_tags?: string[];
  }>;
}

export function ProjectsDashboardTabs({ projects, songs }: ProjectsDashboardTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabId>(
    (tabParam && TABS.find((t) => t.id === tabParam)) ? (tabParam as TabId) : 'overview'
  );

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && TABS.find((t) => t.id === tab)) {
      setActiveTab(tab as TabId);
    } else if (!tab && activeTab !== 'overview') {
      router.replace('?tab=overview', { scroll: false });
    }
  }, [searchParams, router, activeTab]);

  const changeTab = (tab: TabId) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Dashboard tabs" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => changeTab(tab.id)}
              aria-current={tab.id === activeTab ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                tab.id === activeTab
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                  : 'border-border/60 bg-surface text-muted-foreground hover:text-brand-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'overview' && <ProjectList items={projects} />}
      {activeTab === 'songs' && <SongList songs={songs} projects={projects} />}
    </div>
  );
}















