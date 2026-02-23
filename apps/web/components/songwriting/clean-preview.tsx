'use client';

import { motion } from 'motion/react';
import { Copy, Check, Printer, Download, Music, FileText } from '@/components/ui/custom-icons';
import { useState, useMemo } from 'react';

type ChordPlacement = {
  wordIndex: number;
  lineIndex: number;
  chord: string;
};

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'intro' | 'outro';
  content: string;
  chordPlacements?: ChordPlacement[];
};

type CopyrightInfo = {
  copyrightYear?: number;
  copyrightHolder?: string;
  performingRightsOrg?: string;
  splits?: Array<{
    contributorName: string;
    role: string;
    percentage: number;
  }>;
};

interface CleanPreviewProps {
  songTitle: string;
  blocks: SongBlock[];
  songKey?: string;
  tempo?: number;
  timeSignature?: string;
  copyrightInfo?: CopyrightInfo;
}

// Section colors for visual distinction
const SECTION_COLORS: Record<string, string> = {
  verse: '#3B82F6',
  chorus: '#F59E0B',
  bridge: '#8B5CF6',
  'pre-chorus': '#10B981',
  intro: '#EC4899',
  outro: '#6366F1',
};

export function CleanPreview({
  songTitle,
  blocks,
  songKey,
  tempo,
  timeSignature,
  copyrightInfo,
}: CleanPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showChords, setShowChords] = useState(true);

  // Count sections
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    blocks.forEach((block) => {
      counts[block.type] = (counts[block.type] || 0) + 1;
    });
    return counts;
  }, [blocks]);

  // Get section number for a block
  const getSectionNumber = (block: SongBlock, index: number) => {
    let count = 0;
    for (let i = 0; i <= index; i++) {
      if (blocks[i].type === block.type) count++;
    }
    return sectionCounts[block.type] > 1 ? count : null;
  };

  // Generate plain text version
  const plainText = useMemo(() => {
    let text = `${songTitle}\n`;
    if (songKey || tempo || timeSignature) {
      const meta = [songKey, tempo ? `${tempo} BPM` : null, timeSignature]
        .filter(Boolean)
        .join(' • ');
      text += `${meta}\n`;
    }
    text += '\n';

    blocks.forEach((block, index) => {
      const sectionNum = getSectionNumber(block, index);
      const label = block.type.toUpperCase().replace('-', ' ');
      text += `[${label}${sectionNum ? ` ${sectionNum}` : ''}]\n`;

      if (showChords && block.chordPlacements && block.chordPlacements.length > 0) {
        // Add chords inline with lyrics
        const lines = block.content.split('\n');
        lines.forEach((line, lineIndex) => {
          const words = line.split(/(\s+)/);
          const chordsForLine =
            block.chordPlacements?.filter((p) => p.lineIndex === lineIndex) || [];

          if (chordsForLine.length > 0) {
            // Build chord line
            let chordLine = '';
            let position = 0;
            words.forEach((word, wordIndex) => {
              if (!word.trim()) {
                chordLine += word;
                position += word.length;
                return;
              }
              const actualWordIndex = words.slice(0, wordIndex).filter((w) => w.trim()).length;
              const chord = chordsForLine.find((c) => c.wordIndex === actualWordIndex);
              if (chord) {
                chordLine += chord.chord.padEnd(word.length + 1);
              } else {
                chordLine += ' '.repeat(word.length + 1);
              }
              position += word.length + 1;
            });
            text += chordLine.trimEnd() + '\n';
          }
          text += line + '\n';
        });
      } else {
        text += block.content + '\n';
      }
      text += '\n';
    });

    // Add copyright footer if available
    if (copyrightInfo?.copyrightYear || copyrightInfo?.copyrightHolder) {
      text += '\n---\n';
      const year = copyrightInfo.copyrightYear || new Date().getFullYear();
      const holder = copyrightInfo.copyrightHolder || '';
      const pro = copyrightInfo.performingRightsOrg
        ? ` (${copyrightInfo.performingRightsOrg})`
        : '';
      text += `© ${year} ${holder}${pro}\n`;

      // Add writer credits if splits exist
      if (copyrightInfo.splits && copyrightInfo.splits.length > 0) {
        const writers = copyrightInfo.splits
          .filter((s) => s.role === 'writer' || s.role === 'composer')
          .map((s) => s.contributorName)
          .join(', ');
        if (writers) {
          text += `Written by: ${writers}\n`;
        }
      }
    }

    return text.trim();
  }, [songTitle, blocks, songKey, tempo, timeSignature, showChords, sectionCounts, copyrightInfo]);

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Download as text file
  const handleDownload = () => {
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(255, 99, 71, 0.1)' }}
        >
          <FileText className="h-8 w-8" style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
          No Sections Yet
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Add verses, choruses, and other sections in the Structure tab to see your clean output
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Clean Output
          </span>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showChords}
              onChange={(e) => setShowChords(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500/20"
            />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Show Chords
            </span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={{ background: 'var(--background)', color: 'var(--text)' }}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={{ background: 'var(--background)', color: 'var(--text)' }}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={{ background: 'var(--background)', color: 'var(--text)' }}
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </motion.button>
        </div>
      </div>

      {/* Clean Preview */}
      <div
        className="rounded-lg p-6 print:border-none print:p-0 print:shadow-none"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        id="clean-preview-content"
      >
        {/* Title & Meta */}
        <div className="mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <h1 className="mb-1 text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {songTitle}
          </h1>
          {(songKey || tempo || timeSignature) && (
            <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--muted)' }}>
              {songKey && (
                <span className="flex items-center gap-1">
                  <Music className="h-3.5 w-3.5" />
                  Key: {songKey}
                </span>
              )}
              {tempo && <span>{tempo} BPM</span>}
              {timeSignature && <span>{timeSignature}</span>}
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {blocks.map((block, index) => {
            const sectionNum = getSectionNumber(block, index);
            const color = SECTION_COLORS[block.type] || '#6B7280';
            const lines = block.content.split('\n');

            return (
              <div key={block.id} className="group">
                {/* Section Header */}
                <div
                  className="mb-2 inline-flex items-center gap-2 rounded px-2 py-0.5 text-xs font-bold tracking-wider uppercase"
                  style={{ background: `${color}20`, color }}
                >
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                  {block.type.replace('-', ' ')}
                  {sectionNum && <span>{sectionNum}</span>}
                </div>

                {/* Lyrics with Chords */}
                <div className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {lines.map((line, lineIndex) => {
                    if (!line.trim()) {
                      return <div key={lineIndex} className="h-4" />;
                    }

                    const words = line.split(/(\s+)/);
                    const chordsForLine =
                      showChords && block.chordPlacements
                        ? block.chordPlacements.filter((p) => p.lineIndex === lineIndex)
                        : [];

                    // If no chords on this line, just show the lyrics
                    if (chordsForLine.length === 0) {
                      return (
                        <div key={lineIndex} className="whitespace-pre-wrap">
                          {line}
                        </div>
                      );
                    }

                    // Show chords above words
                    return (
                      <div key={lineIndex} className="mb-1">
                        {/* Chord Line */}
                        <div
                          className="flex flex-wrap text-xs font-bold"
                          style={{ color: 'var(--accent)' }}
                        >
                          {words.map((word, wordIndex) => {
                            if (!word.trim()) {
                              return (
                                <span key={wordIndex} className="whitespace-pre">
                                  {word}
                                </span>
                              );
                            }
                            const actualWordIndex = words
                              .slice(0, wordIndex)
                              .filter((w) => w.trim()).length;
                            const chord = chordsForLine.find(
                              (c) => c.wordIndex === actualWordIndex
                            );
                            return (
                              <span key={wordIndex} className="whitespace-pre">
                                {chord ? chord.chord : '\u00A0'.repeat(word.length)}
                                {wordIndex < words.length - 1 ? ' ' : ''}
                              </span>
                            );
                          })}
                        </div>
                        {/* Lyrics Line */}
                        <div className="whitespace-pre-wrap">{line}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Copyright Footer */}
        {(copyrightInfo?.copyrightYear || copyrightInfo?.copyrightHolder) && (
          <div
            className="mt-8 border-t pt-4 text-xs"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            <div className="flex flex-wrap items-center gap-1">
              <span>©</span>
              <span>{copyrightInfo.copyrightYear || new Date().getFullYear()}</span>
              {copyrightInfo.copyrightHolder && <span>{copyrightInfo.copyrightHolder}</span>}
              {copyrightInfo.performingRightsOrg && (
                <span className="opacity-75">({copyrightInfo.performingRightsOrg})</span>
              )}
            </div>
            {copyrightInfo.splits && copyrightInfo.splits.length > 0 && (
              <div className="mt-1">
                Written by:{' '}
                {copyrightInfo.splits
                  .filter((s) => s.role === 'writer' || s.role === 'composer')
                  .map((s) => s.contributorName)
                  .join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #clean-preview-content,
          #clean-preview-content * {
            visibility: visible;
          }
          #clean-preview-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px !important;
          }
          #clean-preview-content h1 {
            color: black !important;
          }
          #clean-preview-content [style*='color: var(--text)'] {
            color: black !important;
          }
          #clean-preview-content [style*='color: var(--muted)'] {
            color: #666 !important;
          }
          #clean-preview-content [style*='color: var(--accent)'] {
            color: #d35400 !important;
          }
        }
      `}</style>
    </div>
  );
}
