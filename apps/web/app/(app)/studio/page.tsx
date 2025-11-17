'use client';

import { NavBar } from '@/components/NavBar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function StudioPage() {
  const [activeMode, setActiveMode] = useState<'recording' | 'streaming' | 'collaboration' | 'schedule'>('recording');

  const studioModes = [
    {
      id: 'recording',
      title: 'RECORDING',
      subtitle: 'CAPTURE YOUR SOUND',
      description: 'Professional HD recording',
      features: ['48kHz/24-bit Audio', 'Multi-track Recording', 'Cloud Storage', 'Auto Backup'],
      cta: 'START SESSION',
      href: '/projects',
      gradient: 'from-red-950/20 to-black',
      accent: 'red'
    },
    {
      id: 'streaming',
      title: 'LIVE STREAM',
      subtitle: 'BROADCAST WORLDWIDE',
      description: 'Stream to all platforms',
      features: ['YouTube/Twitch/Facebook', '1080p HD Video', 'Custom RTMP', 'Chat Integration'],
      cta: 'GO LIVE',
      href: '/projects',
      gradient: 'from-blue-950/20 to-black',
      accent: 'blue'
    },
    {
      id: 'collaboration',
      title: 'COLLABORATE',
      subtitle: 'CONNECT WITH ARTISTS',
      description: 'Real-time remote sessions',
      features: ['Video Calls', 'Screen Sharing', 'DAW Control', 'Low Latency'],
      cta: 'INVITE MUSICIANS',
      href: '/projects',
      gradient: 'from-green-950/20 to-black',
      accent: 'green'
    },
    {
      id: 'schedule',
      title: 'SCHEDULE',
      subtitle: 'PLAN YOUR SESSIONS',
      description: 'Studio time management',
      features: ['Calendar Sync', 'Reminder Alerts', 'Team Availability', 'Time Zones'],
      cta: 'VIEW CALENDAR',
      href: '/projects',
      gradient: 'from-purple-950/20 to-black',
      accent: 'purple'
    }
  ] as const;

  const activeStudioMode = studioModes.find(mode => mode.id === activeMode)!;

  return (
    <main className="min-h-screen bg-zinc-950 pt-20">
        {/* Studio Header */}
        <section className="border-b border-zinc-800 bg-black/50">
          <div className="container mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h1 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400 mb-2">
                PROFESSIONAL STUDIO
              </h1>
              <p className="font-[family-name:var(--rnrb-font-marker)] text-4xl mb-8 text-white">
                Cloud Recording Studio
              </p>
              
              {/* Mode Selector */}
              <div className="flex gap-6">
                {studioModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode.id as any)}
                    className={`
                      font-mono text-xs uppercase tracking-[0.2em] pb-4
                      transition-all duration-300
                      ${activeMode === mode.id 
                        ? 'text-white border-b-2 border-white' 
                        : 'text-zinc-600 hover:text-zinc-400'
                      }
                    `}
                  >
                    {mode.title}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Active Mode Display */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <div className={`
                border border-zinc-800 
                bg-gradient-to-br ${activeStudioMode.gradient}
                overflow-hidden
              `}>
                {/* Mode Header */}
                <div className="p-12 text-center border-b border-zinc-800">
                  <h2 className="font-mono text-4xl uppercase tracking-wider mb-2">
                    {activeStudioMode.subtitle}
                  </h2>
                  <p className="text-zinc-400 text-lg">
                    {activeStudioMode.description}
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4">
                  {activeStudioMode.features.map((feature, index) => (
                    <div 
                      key={index}
                      className="p-6 border-r border-b border-zinc-800 last:border-r-0 md:odd:last:border-r md:last:border-b-0 md:[&:nth-last-child(-n+4)]:border-b-0"
                    >
                      <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                        {String(index + 1).padStart(2, '0')}
                      </p>
                      <p className="mt-2 text-sm uppercase tracking-wider">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-12 text-center bg-black/40">
                  <Link 
                    href={activeStudioMode.href}
                    className={`
                      inline-block px-12 py-4 
                      bg-white text-black 
                      font-mono text-xs uppercase tracking-[0.3em]
                      hover:bg-zinc-200 transition-colors
                    `}
                  >
                    {activeStudioMode.cta}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="border-t border-zinc-900 py-20">
          <div className="container mx-auto px-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-8 text-center">
              TECHNICAL SPECIFICATIONS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'AUDIO ENGINE', specs: ['48kHz/24-bit', 'Zero Latency', 'VST Support', 'MIDI Control'] },
                { label: 'VIDEO QUALITY', specs: ['1080p @ 60fps', '4K Ready', 'H.264 Codec', 'Hardware Accel'] },
                { label: 'CONNECTIVITY', specs: ['WebRTC P2P', 'Global CDN', 'Auto Failover', '< 50ms RTT'] }
              ].map((category) => (
                <div key={category.label} className="border border-zinc-800 p-6">
                  <h4 className="font-mono text-sm uppercase tracking-widest mb-4">
                    {category.label}
                  </h4>
                  <ul className="space-y-2">
                    {category.specs.map((spec, index) => (
                      <li key={index} className="text-sm text-zinc-400 flex items-center gap-2">
                        <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recording Guide Link */}
        <section className="py-12 border-t border-zinc-900">
          <div className="container mx-auto px-6 text-center">
            <Link 
              href="/studio/recording-guide"
              className="text-zinc-600 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors"
            >
              VIEW RECORDING GUIDE →
            </Link>
          </div>
        </section>
    </main>
  );
}