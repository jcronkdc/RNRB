'use client';

import { motion } from 'framer-motion';
import {
  Music,
  FolderOpen,
  Calendar,
  Radio,
  Guitar,
  Users,
  ChevronRight,
  Plus,
  Loader2,
  FileAudio,
  Mic2,
  Target,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

// Icon mapping for different entity types
const entityIcons: Record<string, any> = {
  song: Music,
  project: FolderOpen,
  setlist: FileAudio,
  show: Calendar,
  tour: Radio,
  gear: Guitar,
  collaborator: Users,
  practice: Target,
  recording: Mic2,
};

// Color mapping for entity types
const entityColors: Record<string, string> = {
  song: 'from-pink-500 to-rose-600',
  project: 'from-blue-500 to-indigo-600',
  setlist: 'from-purple-500 to-violet-600',
  show: 'from-orange-500 to-amber-600',
  tour: 'from-green-500 to-emerald-600',
  gear: 'from-yellow-500 to-orange-600',
  collaborator: 'from-cyan-500 to-blue-600',
  practice: 'from-red-500 to-pink-600',
  recording: 'from-indigo-500 to-purple-600',
};

interface RelatedItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  href: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface RelatedContentSectionProps {
  title: string;
  type: string;
  items: RelatedItem[];
  addHref?: string;
  addLabel?: string;
  showEmpty?: boolean;
  emptyMessage?: string;
}

function RelatedItemCard({ item }: { item: RelatedItem }) {
  const Icon = entityIcons[item.type] || Music;
  const color = entityColors[item.type] || 'from-gray-500 to-slate-600';

  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        className="group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04]"
      >
        {item.imageUrl ? (
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={item.imageUrl}
              alt={item.title}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color}`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-white group-hover:text-orange-400">
            {item.title}
          </h4>
          {item.subtitle && <p className="truncate text-xs text-white/50">{item.subtitle}</p>}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white/50" />
      </motion.div>
    </Link>
  );
}

export function RelatedContentSection({
  title,
  type,
  items,
  addHref,
  addLabel = 'Add',
  showEmpty = true,
  emptyMessage,
}: RelatedContentSectionProps) {
  const Icon = entityIcons[type] || Music;
  const color = entityColors[type] || 'from-gray-500 to-slate-600';

  if (!showEmpty && items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${color}`}
          >
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          {title}
          <span className="rounded-full bg-white/10 px-1.5 text-xs text-white/50">
            {items.length}
          </span>
        </h3>
        {addHref && (
          <Link
            href={addHref}
            className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
          >
            <Plus className="h-3 w-3" />
            {addLabel}
          </Link>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <RelatedItemCard key={item.id} item={item} />
          ))}
          {items.length > 5 && (
            <Link
              href={`/${type}s`}
              className="block text-center text-xs text-white/50 hover:text-white"
            >
              View all {items.length} →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-4 text-center">
          <Icon className="mx-auto mb-2 h-6 w-6 text-white/20" />
          <p className="text-xs text-white/40">{emptyMessage || `No ${type}s linked yet`}</p>
          {addHref && (
            <Link
              href={addHref}
              className="mt-2 inline-block text-xs text-orange-400 hover:text-orange-300"
            >
              {addLabel} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// Smart related content component that auto-fetches based on context
interface RelatedContentProps {
  // Context - what entity are we viewing?
  entityType: 'song' | 'project' | 'show' | 'tour' | 'gear' | 'setlist';
  entityId: string;

  // Which related types to show
  showSongs?: boolean;
  showProjects?: boolean;
  showSetlists?: boolean;
  showShows?: boolean;
  showTours?: boolean;
  showGear?: boolean;
  showCollaborators?: boolean;
  showPractice?: boolean;
  showRecordings?: boolean;

  // Layout
  className?: string;
}

export function RelatedContent({
  entityType,
  entityId,
  showSongs = true,
  showProjects = true,
  showSetlists = false,
  showShows = false,
  showTours = false,
  showGear = false,
  showCollaborators = true,
  showPractice = false,
  showRecordings = false,
  className = '',
}: RelatedContentProps) {
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Record<string, RelatedItem[]>>({
    songs: [],
    projects: [],
    setlists: [],
    shows: [],
    tours: [],
    gear: [],
    collaborators: [],
    practice: [],
    recordings: [],
  });

  const loadRelated = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/ecosystem/related?entityType=${entityType}&entityId=${entityId}`
      );
      if (response.ok) {
        const data = await response.json();
        setRelated(data.related || {});
      }
    } catch (error) {
      console.error('Error loading related content:', error);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadRelated();
  }, [loadRelated]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showSongs && entityType !== 'song' && (
        <RelatedContentSection
          title="Songs"
          type="song"
          items={related.songs}
          addHref="/songwriting"
          addLabel="Write Song"
          emptyMessage="No songs linked to this yet"
        />
      )}

      {showProjects && entityType !== 'project' && (
        <RelatedContentSection
          title="Projects"
          type="project"
          items={related.projects}
          addHref="/projects/new"
          addLabel="New Project"
          emptyMessage="Not part of any project"
        />
      )}

      {showSetlists && (
        <RelatedContentSection
          title="Setlists"
          type="setlist"
          items={related.setlists}
          addHref="/setlists/new"
          addLabel="New Setlist"
          showEmpty={false}
        />
      )}

      {showShows && (
        <RelatedContentSection
          title="Shows"
          type="show"
          items={related.shows}
          addHref="/shows/new"
          addLabel="Schedule Show"
          showEmpty={false}
        />
      )}

      {showTours && (
        <RelatedContentSection
          title="Tours"
          type="tour"
          items={related.tours}
          addHref="/tours/new"
          addLabel="Plan Tour"
          showEmpty={false}
        />
      )}

      {showGear && (
        <RelatedContentSection
          title="Gear Used"
          type="gear"
          items={related.gear}
          addHref="/tools?tool=gear-tracker"
          addLabel="Add Gear"
          emptyMessage="No gear linked"
        />
      )}

      {showCollaborators && (
        <RelatedContentSection
          title="Collaborators"
          type="collaborator"
          items={related.collaborators}
          addHref="/discover"
          addLabel="Find Musicians"
          emptyMessage="No collaborators yet"
        />
      )}

      {showPractice && (
        <RelatedContentSection
          title="Practice Sessions"
          type="practice"
          items={related.practice}
          addHref="/tools?tool=practice-logger"
          addLabel="Log Practice"
          showEmpty={false}
        />
      )}

      {showRecordings && (
        <RelatedContentSection
          title="Recording Notes"
          type="recording"
          items={related.recordings}
          addHref="/studio"
          addLabel="Add Notes"
          showEmpty={false}
        />
      )}
    </div>
  );
}

// Quick link cards for the dashboard
interface QuickLinkCardProps {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  badge?: string;
}

export function QuickLinkCard({
  title,
  subtitle,
  href,
  icon: Icon,
  gradient,
  badge,
}: QuickLinkCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 shadow-lg transition-all`}
      >
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-xs text-white/70">{subtitle}</p>
          </div>
          {badge && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
              {badge}
            </span>
          )}
          <ChevronRight className="h-4 w-4 text-white/50 transition-transform group-hover:translate-x-1" />
        </div>
      </motion.div>
    </Link>
  );
}
