'use client';

import { 
  DollarSign, 
  Music, 
  Users, 
  Calendar, 
  FileText, 
  Upload,
  Mic,
  TrendingUp,
  Clock,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';

// Activity type definition
type ActivityType = {
  id: number;
  type: string;
  icon: typeof DollarSign;
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
  color: string;
  bgColor: string;
};

// Mock activity data
const activities: ActivityType[] = [
  {
    id: 1,
    type: 'revenue',
    icon: DollarSign,
    title: 'Spotify Royalties Received',
    description: 'Q3 2024 payment processed',
    amount: '+$2,847',
    timestamp: '2 hours ago',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 2,
    type: 'upload',
    icon: Upload,
    title: 'New Track Uploaded',
    description: 'Midnight Drive (Demo Version)',
    timestamp: '5 hours ago',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 3,
    type: 'collaboration',
    icon: Users,
    title: 'Collaboration Request',
    description: 'Sarah Johnson wants to collaborate',
    timestamp: '1 day ago',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 4,
    type: 'show',
    icon: Calendar,
    title: 'Show Scheduled',
    description: 'The Basement Rock Club - Dec 15',
    timestamp: '2 days ago',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  {
    id: 5,
    type: 'milestone',
    icon: TrendingUp,
    title: 'Milestone Reached',
    description: '1 Million streams on "Echo Chamber"',
    timestamp: '3 days ago',
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10'
  },
  {
    id: 6,
    type: 'recording',
    icon: Mic,
    title: 'Recording Session',
    description: 'Studio A - 4 hours logged',
    timestamp: '4 days ago',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  {
    id: 7,
    type: 'document',
    icon: FileText,
    title: 'Contract Signed',
    description: 'Distribution agreement finalized',
    timestamp: '5 days ago',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10'
  },
  {
    id: 8,
    type: 'revenue',
    icon: DollarSign,
    title: 'Apple Music Payment',
    description: 'Monthly royalties deposited',
    amount: '+$1,234',
    timestamp: '6 days ago',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    id: 9,
    type: 'release',
    icon: Music,
    title: 'Track Released',
    description: 'Neon Dreams now available everywhere',
    timestamp: '1 week ago',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 10,
    type: 'collaboration',
    icon: Users,
    title: 'New Team Member',
    description: 'Alex Martinez joined your project',
    timestamp: '1 week ago',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
];

// Memoized activity card component
const ActivityCard = memo(({ 
  activity, 
  index 
}: { 
  activity: ActivityType; 
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="rnrb-card p-6 hover:shadow-elevated transition-shadow"
  >
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
        <activity.icon className={`w-6 h-6 ${activity.color}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{activity.title}</h3>
            <p className="text-muted-foreground">{activity.description}</p>
            {activity.amount && (
              <p className="text-lg font-bold text-green-500 mt-2">{activity.amount}</p>
            )}
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {activity.timestamp}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
));
ActivityCard.displayName = 'ActivityCard';

// Memoized filter button component
const FilterButton = memo(({ 
  label,
  isActive,
  onClick
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all
      ${isActive 
        ? 'bg-brand-primary text-white' 
        : 'bg-surface text-muted-foreground hover:bg-surface-elevated'
      }
    `}
  >
    {label}
  </button>
));
FilterButton.displayName = 'FilterButton';

type FilterType = 'all' | 'revenue' | 'music' | 'collaboration';

export default function ActivityPage() {
  const [filter, setFilter] = useState<FilterType>('all');

  // Memoized filter handlers
  const setAllFilter = useCallback(() => setFilter('all'), []);
  const setRevenueFilter = useCallback(() => setFilter('revenue'), []);
  const setMusicFilter = useCallback(() => setFilter('music'), []);
  const setCollaborationFilter = useCallback(() => setFilter('collaboration'), []);

  // Memoized filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (filter === 'all') return true;
      if (filter === 'revenue') return activity.type === 'revenue';
      if (filter === 'music') return ['upload', 'release', 'recording'].includes(activity.type);
      if (filter === 'collaboration') return activity.type === 'collaboration';
      return true;
    });
  }, [filter]);

  const hasActivities = filteredActivities.length > 0;

  return (
    <div className="container mx-auto max-w-5xl py-8 px-6">
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="text-sm text-muted-foreground hover:text-brand-foreground inline-flex items-center gap-2 mb-4"
        >
          ← Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-foreground mb-2">Activity Feed</h1>
            <p className="text-muted-foreground">
              Your recent actions and updates across the platform
            </p>
          </div>
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rnrb-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            Filter:
          </div>
          <div className="flex gap-2">
            <FilterButton label="All Activity" isActive={filter === 'all'} onClick={setAllFilter} />
            <FilterButton label="Revenue" isActive={filter === 'revenue'} onClick={setRevenueFilter} />
            <FilterButton label="Music" isActive={filter === 'music'} onClick={setMusicFilter} />
            <FilterButton label="Collaboration" isActive={filter === 'collaboration'} onClick={setCollaborationFilter} />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {filteredActivities.map((activity, index) => (
          <ActivityCard key={activity.id} activity={activity} index={index} />
        ))}
      </div>

      {/* Empty State */}
      {!hasActivities && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground">
            Your recent actions will appear here
          </p>
        </div>
      )}

      {/* Load More */}
      {hasActivities && (
        <div className="mt-8 text-center">
          <button className="rnrb-button-secondary px-6 py-3 rounded-lg">
            Load More Activity
          </button>
        </div>
      )}
    </div>
  );
}

