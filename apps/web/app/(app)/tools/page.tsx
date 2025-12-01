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
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-500/5 to-transparent blur-3xl" />
      </div>

      {/* Logo & Header Section */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* RR Logo - white logo for dark bg */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex flex-col items-center"
          >
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">Musician's Toolbox</h1>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>
              Professional tools for practice, performance & business
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container relative z-10 max-w-7xl px-4 py-8">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-brand-primary to-orange-500 text-white shadow-lg shadow-brand-primary/25'
                    : 'border border-white/10 bg-white/5 text-[color:var(--muted)] hover:border-white/20 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.name}
              </motion.button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2.5 transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-[color:var(--muted)] hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2.5 transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-[color:var(--muted)] hover:bg-white/10 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Active Tool Display */}
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => setActiveTool(null)}
              className="mb-4 text-sm text-[color:var(--muted)] hover:text-white"
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
                ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-4'
            }
          >
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                onClick={() => tool.status === 'ready' && setActiveTool(tool.id)}
                className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  tool.status === 'ready'
                    ? 'cursor-pointer border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/20 hover:from-white/[0.12] hover:to-white/[0.04] hover:shadow-xl hover:shadow-black/20'
                    : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50'
                } ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
              >
                {/* Gradient glow on hover */}
                <div
                  className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${tool.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}
                />

                {/* Top accent line */}
                <div
                  className={`absolute left-4 right-4 top-0 h-[2px] rounded-full bg-gradient-to-r ${tool.gradient} opacity-0 transition-all duration-300 group-hover:opacity-100`}
                />

                <div
                  className={`relative z-10 ${viewMode === 'grid' ? 'p-6' : 'flex flex-1 items-center gap-4 p-5'}`}
                >
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                      viewMode === 'grid' ? 'mb-5 h-14 w-14' : 'h-12 w-12 flex-shrink-0'
                    }`}
                  >
                    <tool.icon
                      className={viewMode === 'grid' ? 'h-7 w-7 text-white' : 'h-6 w-6 text-white'}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-white">
                        {tool.name}
                      </h3>
                      {tool.status === 'coming-soon' && (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/60">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                      {tool.description}
                    </p>
                  </div>

                  {/* Category Badge & Arrow */}
                  {viewMode === 'grid' && (
                    <div className="mt-5 flex items-center justify-between">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium capitalize text-white/50">
                        {tool.category}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all duration-300 group-hover:bg-white/10 group-hover:text-white">
                        →
                      </span>
                    </div>
                  )}

                  {/* List view arrow */}
                  {viewMode === 'list' && tool.status === 'ready' && (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/40 transition-all duration-300 group-hover:bg-white/10 group-hover:text-white">
                      →
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div className="group">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
                {TOOLS.filter((t) => t.status === 'ready').length}
              </div>
              <div className="mt-1 text-sm font-medium text-white/50">Tools Ready</div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
                {TOOLS.filter((t) => t.status === 'coming-soon').length}
              </div>
              <div className="mt-1 text-sm font-medium text-white/50">Coming Soon</div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
                {CATEGORIES.length - 1}
              </div>
              <div className="mt-1 text-sm font-medium text-white/50">Categories</div>
            </div>
            <div className="group">
              <div className="bg-gradient-to-br from-brand-primary to-rose-500 bg-clip-text text-4xl font-bold text-transparent transition-transform duration-300 group-hover:scale-110">
                100%
              </div>
              <div className="mt-1 text-sm font-medium text-white/50">Free Forever</div>
            </div>
          </div>
        </motion.div>
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
          <div className="animate-pulse text-[color:var(--muted)]">Loading tools...</div>
        </div>
      }
    >
      <ToolsContent />
    </Suspense>
  );
}
