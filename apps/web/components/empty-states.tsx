'use client';

import { motion } from 'framer-motion';
import { 
  Music2,
  Sparkles,
  Folder,
  FolderOpen,
  Library,
  Users,
  Compass,
  Plus,
  Upload,
  Search,
  Mic2,
  Radio,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  AlertCircle,
  WifiOff
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

const stateConfigs: Record<EmptyStateType, {
  icon: React.ElementType;
  defaultTitle: string;
  defaultDescription: string;
  defaultActionLabel: string;
  defaultActionHref?: string;
}> = {
  projects: {
    icon: FolderOpen,
    defaultTitle: "No projects yet",
    defaultDescription: "Create your first project to start making music",
    defaultActionLabel: "Create Project",
    defaultActionHref: "/projects/new"
  },
  tracks: {
    icon: Music2,
    defaultTitle: "No tracks in this project",
    defaultDescription: "Generate your first AI track or upload existing audio",
    defaultActionLabel: "Create Track",
    defaultActionHref: "/create"
  },
  library: {
    icon: Library,
    defaultTitle: "Your library is empty",
    defaultDescription: "Assets from your projects will appear here",
    defaultActionLabel: "Browse Projects",
    defaultActionHref: "/projects"
  },
  search: {
    icon: Search,
    defaultTitle: "No results found",
    defaultDescription: "Try adjusting your search terms or filters",
    defaultActionLabel: "Clear Search"
  },
  collaborations: {
    icon: Users,
    defaultTitle: "No active collaborations",
    defaultDescription: "Invite others to collaborate on your projects",
    defaultActionLabel: "Invite Collaborators"
  },
  messages: {
    icon: MessageSquare,
    defaultTitle: "No messages yet",
    defaultDescription: "Messages from collaborators will appear here",
    defaultActionLabel: "Start a Project",
    defaultActionHref: "/projects"
  },
  analytics: {
    icon: BarChart3,
    defaultTitle: "No data available",
    defaultDescription: "Analytics will appear once you have active projects",
    defaultActionLabel: "Create Project",
    defaultActionHref: "/projects/new"
  },
  error: {
    icon: AlertCircle,
    defaultTitle: "Something went wrong",
    defaultDescription: "We encountered an error loading this content",
    defaultActionLabel: "Try Again"
  },
  offline: {
    icon: WifiOff,
    defaultTitle: "You're offline",
    defaultDescription: "Check your internet connection and try again",
    defaultActionLabel: "Retry"
  }
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
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
      className="
        flex flex-col items-center justify-center
        py-12 px-6 text-center
        min-h-[400px]
      "
    >
      {/* Icon with subtle animation */}
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
          repeatDelay: 3
        }}
        className="
          w-20 h-20 rounded-full
          bg-surface flex items-center justify-center
          mb-6
        "
      >
        <Icon className="w-10 h-10 text-foreground-muted" />
      </motion.div>
      
      {/* Text content */}
      <h3 className="text-xl font-semibold mb-2">
        {finalTitle}
      </h3>
      <p className="text-foreground-muted max-w-sm mb-6">
        {finalDescription}
      </p>
      
      {/* Action button */}
      {finalActionHref ? (
        <Link
          href={finalActionHref}
          className="btn-primary"
        >
          {type === 'projects' && <Plus className="w-4 h-4 mr-2" />}
          {type === 'tracks' && <Sparkles className="w-4 h-4 mr-2" />}
          {finalActionLabel}
        </Link>
      ) : (
        <button
          onClick={handleAction}
          className="btn-primary"
        >
          {finalActionLabel}
        </button>
      )}
      
      {/* Additional suggestions for specific types */}
      {type === 'projects' && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
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
        <div className="mt-8 space-y-4 text-left max-w-md">
          <h4 className="text-sm font-medium text-foreground-muted">
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
  href 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="
        p-6 rounded-lg border border-border
        hover:border-border-strong hover:bg-surface
        transition-all duration-200
        text-center group
      "
    >
      <Icon className="w-8 h-8 mx-auto mb-3 text-foreground-muted group-hover:text-foreground" />
      <h5 className="font-medium mb-1">{title}</h5>
      <p className="text-sm text-foreground-muted">{description}</p>
    </Link>
  );
}

function PromptExample({ text }: { text: string }) {
  return (
    <div className="
      p-3 rounded-md bg-surface border border-border
      text-sm hover:border-border-strong
      transition-all duration-200 cursor-pointer
    ">
      {text}
    </div>
  );
}

// Loading States
export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="
        w-12 h-12 rounded-full border-2 border-surface
        border-t-brand-primary animate-spin mb-4
      " />
      <p className="text-foreground-muted">{message}</p>
    </div>
  );
}

// Skeleton Loading for Track Cards
export function TrackCardSkeleton() {
  return (
    <div className="
      bg-surface rounded-lg border border-border
      animate-pulse
    ">
      {/* Album art skeleton */}
      <div className="aspect-square bg-surface-hover rounded-t-lg" />
      
      {/* Info skeleton */}
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-4 bg-surface-hover rounded w-3/4" />
          <div className="h-3 bg-surface-hover rounded w-1/2" />
        </div>
        
        {/* Waveform skeleton */}
        <div className="h-8 flex items-end gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-surface-hover rounded-t"
              style={{ height: `${Math.random() * 100}%` }}
            />
          ))}
        </div>
        
        <div className="flex justify-between">
          <div className="h-3 bg-surface-hover rounded w-20" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-surface-hover rounded" />
            <div className="w-8 h-8 bg-surface-hover rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
