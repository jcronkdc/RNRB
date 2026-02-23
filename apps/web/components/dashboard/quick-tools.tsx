'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  FlaskConical,
  ListMusic,
  Globe,
  // Using existing icons as musician-themed alternatives
  Music2 as SongManuscript,
  Mic2 as VintageCondenserMic,
  Wrench as MusiciansMultiTool,
  Calendar as TourCalendar,
} from '@/components/ui/custom-icons';
import Link from 'next/link';

const tools = [
  {
    icon: SongManuscript,
    label: 'Write Song',
    href: '/songwriting',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Sparkles,
    label: 'AI Sketch',
    href: '/create',
    color: 'from-orange-500 to-red-500',
    badge: 'AI',
  },
  {
    icon: VintageCondenserMic,
    label: 'Studio',
    href: '/studio',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FlaskConical,
    label: 'RNRB Labs',
    href: '/tools',
    color: 'from-emerald-500 to-green-500',
    badge: 'NEW',
  },
  {
    icon: MusiciansMultiTool,
    label: 'Toolbox',
    href: '/tools',
    color: 'from-amber-500 to-yellow-500',
  },
  { icon: TourCalendar, label: 'Shows', href: '/shows', color: 'from-rose-500 to-pink-500' },
  { icon: ListMusic, label: 'Setlists', href: '/setlists', color: 'from-indigo-500 to-violet-500' },
  { icon: Globe, label: 'Tours', href: '/tours', color: 'from-teal-500 to-emerald-500' },
];

export function QuickTools() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-white/10 bg-black/40 p-4"
    >
      <h3 className="mb-4 font-semibold text-white">Quick Access</h3>
      <div className="grid grid-cols-4 gap-2">
        {tools.map((tool, index) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all hover:bg-white/5"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${tool.color} transition-transform group-hover:scale-110`}
            >
              <tool.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-center text-xs text-gray-400 group-hover:text-white">
              {tool.label}
            </span>
            {tool.badge && (
              <span className="absolute -right-1 -top-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {tool.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
