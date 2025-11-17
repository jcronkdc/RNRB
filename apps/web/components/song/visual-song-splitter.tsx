'use client';

import { useState } from 'react';
import { Scissors, Plus, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@cronkwaters/ui';

interface SplitPoint {
  lineIndex: number;
  isSongStart: boolean;
}

interface VisualSongSplitterProps {
  fullText: string;
  onSongsDetected: (songs: Array<{ title: string; lyrics: string; startLine: number; endLine: number }>) => void;
}

export default function VisualSongSplitter({ fullText, onSongsDetected }: VisualSongSplitterProps) {
  const lines = fullText.split('\n');
  const [splitPoints, setSplitPoints] = useState<Set<number>>(new Set([0])); // Always start at 0
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  // Auto-detect song boundaries using intelligent heuristics
  const autoDetect = () => {
    const detected = new Set<number>([0]); // Always include start
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const prevLine = lines[i - 1]?.trim() || '';
      const nextLine = lines[i + 1]?.trim() || '';
      const prev2Line = lines[i - 2]?.trim() || '';
      
      // Patterns that suggest new song:
      const twoBlanksBefore = prevLine === '' && prev2Line === '';
      const shortLineAfterBlanks = line.length > 0 && line.length < 60 && prevLine === '' && nextLine !== '';
      const notSectionMarker = !line.match(/^(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Hook)/i);
      const noColonOrDash = !line.match(/[:—-]/); // Avoid "Verse 1:" type lines
      
      if (twoBlanksBefore && shortLineAfterBlanks && notSectionMarker && noColonOrDash) {
        detected.add(i);
      }
    }
    
    setSplitPoints(detected);
  };

  // Toggle split point at a line
  const toggleSplitPoint = (lineIndex: number) => {
    const updated = new Set(splitPoints);
    if (lineIndex === 0) return; // Can't remove first split point
    
    if (updated.has(lineIndex)) {
      updated.delete(lineIndex);
    } else {
      updated.add(lineIndex);
    }
    setSplitPoints(updated);
  };

  // Generate songs from current split points
  const generateSongs = () => {
    const sortedPoints = Array.from(splitPoints).sort((a, b) => a - b);
    const songs = [];
    
    for (let i = 0; i < sortedPoints.length; i++) {
      const startLine = sortedPoints[i];
      const endLine = sortedPoints[i + 1] || lines.length;
      
      const songLines = lines.slice(startLine, endLine).map(l => l.trim()).filter(l => l);
      if (songLines.length < 2) continue; // Skip empty
      
      const title = songLines[0] || `Untitled Song ${i + 1}`;
      const lyrics = songLines.slice(1).join('\n').trim();
      
      if (lyrics) {
        songs.push({ title, lyrics, startLine, endLine });
      }
    }
    
    onSongsDetected(songs);
  };

  // Get song number for a line
  const getSongNumber = (lineIndex: number): number => {
    const sortedPoints = Array.from(splitPoints).sort((a, b) => a - b);
    for (let i = sortedPoints.length - 1; i >= 0; i--) {
      if (lineIndex >= sortedPoints[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  // Check if line is start of a song
  const isSongStart = (lineIndex: number) => splitPoints.has(lineIndex);

  // Get song color based on number
  const getSongColor = (songNum: number) => {
    const colors = [
      'bg-blue-500/10 border-blue-500/30',
      'bg-purple-500/10 border-purple-500/30',
      'bg-green-500/10 border-green-500/30',
      'bg-yellow-500/10 border-yellow-500/30',
      'bg-red-500/10 border-red-500/30',
      'bg-cyan-500/10 border-cyan-500/30',
    ];
    return colors[(songNum - 1) % colors.length];
  };

  const songsDetected = Array.from(splitPoints).length;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 rnrb-card">
        <div>
          <p className="font-semibold mb-1">{songsDetected} Songs Detected</p>
          <p className="text-xs text-muted-foreground">
            Click any line to add/remove song boundary
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={autoDetect}
            variant="secondary"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Auto-Detect
          </Button>
          <Button
            onClick={generateSongs}
            size="sm"
            disabled={songsDetected < 1}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm Split
          </Button>
        </div>
      </div>

      {/* Visual Text with Clickable Splits */}
      <div className="rnrb-card overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto p-6 bg-surface/30">
          <div className="space-y-0 font-mono text-sm">
            {lines.map((line, index) => {
              const songNum = getSongNumber(index);
              const isStart = isSongStart(index);
              const nextIsStart = index < lines.length - 1 && isSongStart(index + 1);
              
              return (
                <div key={index}>
                  {isStart && index > 0 && (
                    <div className="flex items-center gap-2 py-2 my-2 border-t-2 border-dashed border-brand-primary">
                      <Scissors className="w-4 h-4 text-brand-primary" />
                      <span className="text-xs font-semibold text-brand-primary">
                        SONG {songNum} STARTS HERE
                      </span>
                      <button
                        onClick={() => toggleSplitPoint(index)}
                        className="text-xs text-red-500 hover:text-red-400 ml-auto"
                      >
                        Remove split
                      </button>
                    </div>
                  )}
                  
                  <div
                    className={`group flex items-start gap-3 px-3 py-1 rounded transition-colors ${
                      isStart ? 'bg-brand-primary/5 font-semibold' : ''
                    } ${hoveredLine === index ? 'bg-muted/50' : ''}`}
                    onMouseEnter={() => setHoveredLine(index)}
                    onMouseLeave={() => setHoveredLine(null)}
                  >
                    <span className="text-xs text-muted-foreground w-12 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className={`flex-1 ${line.trim() === '' ? 'text-muted-foreground/30' : 'text-foreground'}`}>
                      {line || '(blank)'}
                    </span>
                    {hoveredLine === index && !isStart && (
                      <button
                        onClick={() => toggleSplitPoint(index)}
                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 rounded text-brand-primary transition-opacity"
                      >
                        <Scissors className="w-3 h-3 inline mr-1" />
                        Split here
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="p-4 rnrb-card bg-muted/20 border-muted">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Hover over any line and click "Split here" to manually mark where a new song starts. 
          The auto-detect usually gets it right, but you have full control.
        </p>
      </div>
    </div>
  );
}
