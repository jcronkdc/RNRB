'use client';

/**
 * Live Teleprompter Component
 *
 * Everyone sees the same lyrics scrolling at the same speed.
 * Perfect for live performances and band rehearsals.
 */

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  Gauge,
  Users,
  Crown,
  ChevronUp,
  ChevronDown,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';
import { useRef, useState, useEffect } from 'react';

import { useTeleprompterSync } from '@/hooks/use-teleprompter-sync';

interface TeleprompterSection {
  id: string;
  name: string;
  position: number; // 0-100 percentage
  content: string;
}

interface LiveTeleprompterProps {
  channelName: string;
  userId: string;
  userName: string;
  isHost?: boolean;
  lyrics: string;
  sections?: TeleprompterSection[];
  songTitle?: string;
  songKey?: string;
  tempo?: number;
}

export function LiveTeleprompter({
  channelName,
  userId,
  userName,
  isHost = false,
  lyrics,
  sections = [],
  songTitle,
  songKey,
  tempo,
}: LiveTeleprompterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(24);

  const {
    state,
    connectedUsers,
    isConnected,
    hostId,
    toggleAutoScroll,
    setScrollSpeed,
    jumpToSection,
    reset,
  } = useTeleprompterSync({
    channelName,
    userId,
    userName,
    containerRef,
    isHost,
    sections: sections.map((s) => ({ id: s.id, name: s.name, position: s.position })),
  });

  const canControl = isHost || !hostId;
  const currentSection = sections.find((s) => s.id === state.currentSection);

  // Speed presets
  const speedPresets = [
    { label: 'Slow', value: 30 },
    { label: 'Medium', value: 50 },
    { label: 'Fast', value: 80 },
    { label: 'Very Fast', value: 120 },
  ];

  // Parse lyrics into lines
  const lines = lyrics.split('\n');

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl"
      style={{ background: '#0a0a0a', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{songTitle || 'Untitled'}</h2>
            {isHost && (
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                <Crown className="h-3 w-3" />
                Host
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-zinc-400">
            {songKey && <span>Key: {songKey}</span>}
            {tempo && <span>{tempo} BPM</span>}
            {currentSection && (
              <span className="font-medium" style={{ color: 'var(--accent)' }}>
                {currentSection.name}
              </span>
            )}
          </div>
        </div>

        {/* Connected Users */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-400" />
            <div className="flex -space-x-2">
              {connectedUsers.slice(0, 4).map((user) => (
                <div
                  key={user.userId}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-900 text-xs font-medium"
                  style={{
                    background: user.isHost ? 'var(--accent)' : 'var(--panel)',
                    color: user.isHost ? 'white' : 'var(--text)',
                  }}
                  title={`${user.userName}${user.isHost ? ' (Host)' : ''}`}
                >
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              ))}
              {connectedUsers.length > 4 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-800 text-xs text-zinc-400">
                  +{connectedUsers.length - 4}
                </div>
              )}
            </div>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-zinc-500'}`}
          />
        </div>
      </div>

      {/* Sections Quick Jump */}
      {sections.length > 0 && (
        <div
          className="flex items-center gap-2 overflow-x-auto px-6 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="flex-shrink-0 text-xs text-zinc-500">Jump to:</span>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => canControl && jumpToSection(section.id)}
              disabled={!canControl}
              className="flex-shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: state.currentSection === section.id ? 'var(--accent)' : 'var(--panel)',
                color: state.currentSection === section.id ? 'white' : 'var(--text)',
              }}
            >
              {section.name}
            </button>
          ))}
        </div>
      )}

      {/* Lyrics Display */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto px-6 py-12"
        style={{
          scrollBehavior: state.isAutoScrolling ? 'auto' : 'smooth',
        }}
      >
        {/* Center Focus Line */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-16 -translate-y-1/2"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(255,107,53,0.1), transparent)',
            borderTop: '1px solid var(--accent)',
            borderBottom: '1px solid var(--accent)',
          }}
        />

        {/* Gradient overlays */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-24"
          style={{ background: 'linear-gradient(to bottom, #0a0a0a, transparent)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-24"
          style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }}
        />

        {/* Lyrics */}
        <div className="mx-auto max-w-3xl space-y-4 py-[40vh]">
          {lines.map((line, index) => {
            // Detect section headers like [VERSE], [CHORUS], etc.
            const isSectionHeader = /^\[.+\]$/.test(line.trim());

            return (
              <motion.p
                key={index}
                className={`text-center transition-all ${
                  isSectionHeader ? 'mb-2 mt-8 text-sm font-bold uppercase tracking-wider' : ''
                }`}
                style={{
                  fontSize: isSectionHeader ? 14 : fontSize,
                  lineHeight: 1.8,
                  color: isSectionHeader ? 'var(--accent)' : 'white',
                }}
              >
                {line || '\u00A0'}
              </motion.p>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--panel)' }}
      >
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => canControl && reset()}
            disabled={!canControl}
            title="Reset to beginning"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => canControl && toggleAutoScroll()}
            disabled={!canControl}
            className="flex items-center gap-2"
            style={{ background: state.isAutoScrolling ? 'var(--accent)' : 'var(--panel)' }}
          >
            {state.isAutoScrolling ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Auto-Scroll
              </>
            )}
          </Button>
        </div>

        {/* Center: Speed Control */}
        <div className="flex items-center gap-3">
          <Gauge className="h-4 w-4 text-zinc-400" />
          <div className="flex items-center gap-1 rounded-lg bg-zinc-800 p-1">
            {speedPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => canControl && setScrollSpeed(preset.value)}
                disabled={!canControl}
                className="rounded-md px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: state.scrollSpeed === preset.value ? 'var(--accent)' : 'transparent',
                  color: state.scrollSpeed === preset.value ? 'white' : 'var(--muted)',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-zinc-500">{state.scrollSpeed}px/s</span>
        </div>

        {/* Right: Font Size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Size</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize((s) => Math.max(16, s - 4))}
              className="rounded p-1 hover:bg-zinc-800"
            >
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>
            <span className="w-8 text-center text-sm text-white">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(48, s + 4))}
              className="rounded p-1 hover:bg-zinc-800"
            >
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Host Control Notice */}
      {hostId && hostId !== userId && (
        <div
          className="px-6 py-2 text-center text-xs"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          {connectedUsers.find((u) => u.userId === hostId)?.userName || 'Host'} is controlling the
          teleprompter
        </div>
      )}
    </div>
  );
}
