'use client';

import { motion } from 'framer-motion';
import {
  Music2,
  Sparkles,
  FolderOpen,
  Library,
  Users,
  Plus,
  Upload,
  Search,
  Mic2,
  MessageSquare,
  BarChart3,
  AlertCircle,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';

type EmptyStateType =
  | 'projects'
  | 'tracks'
  | 'library'
  | 'search'
  | 'collaborations'
  | 'messages'
  | 'analytics'
  | 'error'
  | 'offline';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const stateConfigs: Record<
  EmptyStateType,
  {
    icon: React.ElementType;
    defaultTitle: string;
    defaultDescription: string;
    defaultActionLabel: string;
    defaultActionHref?: string;
  }
> = {
  projects: {
    icon: FolderOpen,
    defaultTitle: 'No projects yet',
    defaultDescription: 'Create your first project to start making music',
    defaultActionLabel: 'Create Project',
    defaultActionHref: '/projects/new',
  },
  tracks: {
    icon: Music2,
    defaultTitle: 'No tracks in this project',
    defaultDescription: 'Generate your first AI track or upload existing audio',
    defaultActionLabel: 'Create Track',
    defaultActionHref: '/create',
  },
  library: {
    icon: Library,
    defaultTitle: 'Your library is empty',
    defaultDescription: 'Assets from your projects will appear here',
    defaultActionLabel: 'Browse Projects',
    defaultActionHref: '/projects',
  },
  search: {
    icon: Search,
    defaultTitle: 'No results found',
    defaultDescription: 'Try adjusting your search terms or filters',
    defaultActionLabel: 'Clear Search',
  },
  collaborations: {
    icon: Users,
    defaultTitle: 'No active collaborations',
    defaultDescription: 'Invite others to collaborate on your projects',
    defaultActionLabel: 'Invite Collaborators',
  },
  messages: {
    icon: MessageSquare,
    defaultTitle: 'No messages yet',
    defaultDescription: 'Messages from collaborators will appear here',
    defaultActionLabel: 'Start a Project',
    defaultActionHref: '/projects',
  },
  analytics: {
    icon: BarChart3,
    defaultTitle: 'No data available',
    defaultDescription: 'Analytics will appear once you have active projects',
    defaultActionLabel: 'Create Project',
    defaultActionHref: '/projects/new',
  },
  error: {
    icon: AlertCircle,
    defaultTitle: 'Something went wrong',
    defaultDescription: 'We encountered an error loading this content',
    defaultActionLabel: 'Try Again',
  },
  offline: {
    icon: WifiOff,
    defaultTitle: "You're offline",
    defaultDescription: 'Check your internet connection and try again',
    defaultActionLabel: 'Retry',
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const config = stateConfigs[type];
  const Icon = config.icon;

  const finalTitle = title || config.defaultTitle;
  const finalDescription = description || config.defaultDescription;
  const finalActionLabel = actionLabel || config.defaultActionLabel;
  const finalActionHref = actionHref || config.defaultActionHref;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[400px] flex-col items-center justify-center px-6 py-12 text-center"
    >
      {/* Icon with subtle animation */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 3,
        }}
        className="bg-surface mb-6 flex h-20 w-20 items-center justify-center rounded-full"
      >
        <Icon className="text-foreground-muted h-10 w-10" />
      </motion.div>

      {/* Text content */}
      <h3 className="mb-2 text-xl font-semibold">{finalTitle}</h3>
      <p className="text-foreground-muted mb-6 max-w-sm">{finalDescription}</p>

      {/* Action button */}
      {finalActionHref ? (
        <Link href={finalActionHref} className="btn-primary">
          {type === 'projects' && <Plus className="mr-2 h-4 w-4" />}
          {type === 'tracks' && <Sparkles className="mr-2 h-4 w-4" />}
          {finalActionLabel}
        </Link>
      ) : (
        <button onClick={handleAction} className="btn-primary">
          {finalActionLabel}
        </button>
      )}

      {/* Additional suggestions for specific types */}
      {type === 'projects' && (
        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAction
            icon={Mic2}
            title="Record Audio"
            description="Start with a recording"
            href="/studio"
          />
          <QuickAction
            icon={Sparkles}
            title="AI Generate"
            description="Create with AI"
            href="/create"
          />
          <QuickAction
            icon={Upload}
            title="Import Files"
            description="Upload existing tracks"
            href="/upload"
          />
        </div>
      )}

      {type === 'tracks' && (
        <div className="mt-8 max-w-md space-y-4 text-left">
          <h4 className="text-foreground-muted text-sm font-medium">
            Example prompts to get started:
          </h4>
          <div className="space-y-2">
            <PromptExample text="A driving rock anthem with powerful guitars" />
            <PromptExample text="Chill lo-fi hip hop beat for studying" />
            <PromptExample text="Epic orchestral piece for a movie trailer" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Helper Components
function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="border-border hover:border-border-strong hover:bg-surface group rounded-lg border p-6 text-center transition-all duration-200"
    >
      <Icon className="text-foreground-muted group-hover:text-foreground mx-auto mb-3 h-8 w-8" />
      <h5 className="mb-1 font-medium">{title}</h5>
      <p className="text-foreground-muted text-sm">{description}</p>
    </Link>
  );
}

function PromptExample({ text }: { text: string }) {
  return (
    <div className="border-border bg-surface hover:border-border-strong cursor-pointer rounded-md border p-3 text-sm transition-all duration-200">
      {text}
    </div>
  );
}

// Loading States
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="border-surface border-t-brand-primary mb-4 h-12 w-12 animate-spin rounded-full border-2" />
      <p className="text-foreground-muted">{message}</p>
    </div>
  );
}

// Skeleton Loading for Track Cards
export function TrackCardSkeleton() {
  return (
    <div className="border-border bg-surface animate-pulse rounded-lg border">
      {/* Album art skeleton */}
      <div className="bg-surface-hover aspect-square rounded-t-lg" />

      {/* Info skeleton */}
      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="bg-surface-hover h-4 w-3/4 rounded" />
          <div className="bg-surface-hover h-3 w-1/2 rounded" />
        </div>

        {/* Waveform skeleton */}
        <div className="flex h-8 items-end gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-hover flex-1 rounded-t"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>

        <div className="flex justify-between">
          <div className="bg-surface-hover h-3 w-20 rounded" />
          <div className="flex gap-2">
            <div className="bg-surface-hover h-8 w-8 rounded" />
            <div className="bg-surface-hover h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
