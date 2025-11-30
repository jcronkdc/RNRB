'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Music2,
  Drum,
  Clock,
  Target,
  Mic,
  Scroll,
  Package,
  FileText,
  Newspaper,
  Repeat,
  PlayCircle,
  ClipboardList,
  LayoutGrid,
  List,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { ChromaticTuner } from '@/components/tools/chromatic-tuner';
import { ClickTrackGenerator } from '@/components/tools/click-track-generator';
import { PracticeLogger } from '@/components/tools/practice-logger';
import { CircleOfFifths } from '@/components/tools/circle-of-fifths';
import { StageplotGenerator } from '@/components/tools/stageplot-generator';
import { GearInventory } from '@/components/tools/gear-inventory';
import { PerformerMode } from '@/components/tools/performer-mode';
import { ContractTemplates } from '@/components/tools/contract-templates';
import { EPKGenerator } from '@/components/tools/epk-generator';
import { LoopPlayer } from '@/components/tools/loop-player';
import { BackingTrackCreator } from '@/components/tools/backing-track-creator';
import { SessionNotes } from '@/components/tools/session-notes';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'practice' | 'theory' | 'performance' | 'business' | 'recording';
  status: 'ready' | 'coming-soon';
  gradient: string;
}

const TOOLS: Tool[] = [
  {
    id: 'tuner',
    name: 'Chromatic Tuner',
    description: 'Accurate pitch detection for any instrument',
    icon: Music2,
    category: 'practice',
    status: 'ready',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'click-track',
    name: 'Click Track Generator',
    description: 'Create tempo tracks for practice & recording',
    icon: Drum,
    category: 'practice',
    status: 'ready',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: 'practice-logger',
    name: 'Practice Logger',
    description: 'Track practice time, set goals, build streaks',
    icon: Clock,
    category: 'practice',
    status: 'ready',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'circle-of-fifths',
    name: 'Circle of Fifths',
    description: 'Interactive music theory reference',
    icon: Target,
    category: 'theory',
    status: 'ready',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'performer-mode',
    name: 'Performer Mode',
    description: 'Teleprompter & lyrics display for live shows',
    icon: Mic,
    category: 'performance',
    status: 'ready',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'stageplot',
    name: 'Stage Plot Generator',
    description: 'Create professional stage layouts for venues',
    icon: LayoutGrid,
    category: 'performance',
    status: 'ready',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'gear-inventory',
    name: 'Gear Inventory',
    description: 'Track equipment, maintenance & insurance',
    icon: Package,
    category: 'business',
    status: 'ready',
    gradient: 'from-slate-500 to-zinc-600',
  },
  {
    id: 'contracts',
    name: 'Contract Templates',
    description: 'Legal templates for venues, sessions & sync',
    icon: FileText,
    category: 'business',
    status: 'ready',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    id: 'epk',
    name: 'EPK Generator',
    description: 'One-click electronic press kits',
    icon: Newspaper,
    category: 'business',
    status: 'ready',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'loop-player',
    name: 'Loop/Slow Player',
    description: 'Slow down audio to learn parts at any tempo',
    icon: Repeat,
    category: 'practice',
    status: 'ready',
    gradient: 'from-lime-500 to-green-600',
  },
  {
    id: 'backing-tracks',
    name: 'Backing Track Creator',
    description: 'Generate backing tracks from stems',
    icon: PlayCircle,
    category: 'recording',
    status: 'ready',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'session-notes',
    name: 'Recording Session Notes',
    description: 'Track gear settings, mics & signal chains',
    icon: ClipboardList,
    category: 'recording',
    status: 'ready',
    gradient: 'from-teal-500 to-emerald-600',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Tools' },
  { id: 'practice', name: 'Practice' },
  { id: 'theory', name: 'Theory' },
  { id: 'performance', name: 'Performance' },
  { id: 'business', name: 'Business' },
  { id: 'recording', name: 'Recording' },
];

function ToolsContent() {
  const searchParams = useSearchParams();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Handle deep links via URL params (e.g., /tools?tool=tuner)
  useEffect(() => {
    const toolParam = searchParams.get('tool');
    if (toolParam) {
      const tool = TOOLS.find((t) => t.id === toolParam);
      if (tool && tool.status === 'ready') {
        setActiveTool(toolParam);
      }
    }
  }, [searchParams]);

  const filteredTools = TOOLS.filter(
    (tool) => activeCategory === 'all' || tool.category === activeCategory
  );

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'tuner':
        return <ChromaticTuner />;
      case 'click-track':
        return <ClickTrackGenerator />;
      case 'practice-logger':
        return <PracticeLogger />;
      case 'circle-of-fifths':
        return <CircleOfFifths />;
      case 'performer-mode':
        return <PerformerMode />;
      case 'stageplot':
        return <StageplotGenerator />;
      case 'gear-inventory':
        return <GearInventory />;
      case 'contracts':
        return <ContractTemplates />;
      case 'epk':
        return <EPKGenerator />;
      case 'loop-player':
        return <LoopPlayer />;
      case 'backing-tracks':
        return <BackingTrackCreator />;
      case 'session-notes':
        return <SessionNotes />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
        <div className="gradient-orb gradient-orb-3"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center"
          >
            <Link href="/" className="group relative inline-block">
              <Image
                src="/logo-light.png"
                alt="Rock N' Roll Basement"
                width={160}
                height={65}
                priority
                className="transition-all duration-300 group-hover:scale-105"
                style={{
                  filter:
                    'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(255, 99, 71, 0.3))',
                }}
              />
            </Link>
            <h1 className="hero-title mt-4 text-center">
              <span className="hero-text-gradient text-2xl font-bold md:text-3xl">
                Musician's Toolbox
              </span>
            </h1>
            <p className="mt-2 text-center text-muted-foreground">
              Professional tools for practice, performance & business
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container relative z-10 max-w-7xl px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand-primary text-white'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 ${viewMode === 'grid' ? 'bg-white/10' : ''}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 ${viewMode === 'list' ? 'bg-white/10' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Tool Display */}
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setActiveTool(null)}
              className="mb-4 text-sm text-muted-foreground hover:text-white"
            >
              ← Back to all tools
            </button>
            {renderActiveTool()}
          </motion.div>
        )}

        {/* Tools Grid */}
        {!activeTool && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-3'
            }
          >
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => tool.status === 'ready' && setActiveTool(tool.id)}
                className={`rnrb-card group relative overflow-hidden transition-all ${
                  tool.status === 'ready'
                    ? 'cursor-pointer hover:border-brand-primary/50'
                    : 'cursor-not-allowed opacity-60'
                } ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 transition-opacity group-hover:opacity-10`}
                />

                <div
                  className={`relative z-10 ${viewMode === 'grid' ? 'p-6' : 'flex flex-1 items-center gap-4 p-4'}`}
                >
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} ${
                      viewMode === 'grid' ? 'mb-4 h-12 w-12' : 'h-10 w-10 flex-shrink-0'
                    }`}
                  >
                    <tool.icon
                      className={viewMode === 'grid' ? 'h-6 w-6 text-white' : 'h-5 w-5 text-white'}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{tool.name}</h3>
                      {tool.status === 'coming-soon' && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                  </div>

                  {/* Category Badge */}
                  {viewMode === 'grid' && (
                    <div className="mt-4 inline-block rounded-full bg-white/5 px-3 py-1 text-xs capitalize text-muted-foreground">
                      {tool.category}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-primary/10 to-purple-500/10 p-6">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">
                {TOOLS.filter((t) => t.status === 'ready').length}
              </div>
              <div className="text-sm text-muted-foreground">Tools Ready</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {TOOLS.filter((t) => t.status === 'coming-soon').length}
              </div>
              <div className="text-sm text-muted-foreground">Coming Soon</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{CATEGORIES.length - 1}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Free Forever</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <div className="animate-pulse text-muted-foreground">Loading tools...</div>
        </div>
      }
    >
      <ToolsContent />
    </Suspense>
  );
}
