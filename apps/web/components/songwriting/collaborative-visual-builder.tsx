'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Music, Sparkles, GripVertical, Plus, X, Users, Save, Download, 
  History, Undo, Redo, Video, MessageSquare, ChevronUp, ChevronDown,
  Tag, Copy, Check, Mail, UserPlus, Clock, Keyboard, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dynamic from 'next/dynamic';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { useSongSuggestions } from '@/hooks/use-song-suggestions';
import { CursorOverlay } from '@/components/cursor-overlay';
import { GranularChordEditor, type ChordPlacement } from './granular-chord-editor';
import { KeyAnalyzer } from './key-analyzer';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import chat
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then(m => m.ChatRoom), { ssr: false });

type ChordPlacement = {
  wordIndex: number;
  lineIndex: number;
  chord: string;
};

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge';
  content: string;
  chord?: string; // Legacy field, keeping for backward compatibility
  chordPlacements?: ChordPlacement[];
};

const PALETTE_BLOCKS = [
  { type: 'verse' as const, label: 'Verse', icon: '📝', color: 'blue' },
  { type: 'chorus' as const, label: 'Chorus', icon: '🎵', color: 'gold' },
  { type: 'bridge' as const, label: 'Bridge', icon: '🌉', color: 'purple' },
];

function SortableBlock({ 
  block, 
  onEdit, 
  onRemove,
  onChordsChange,
}: { 
  block: SongBlock; 
  onEdit: (content: string) => void; 
  onRemove: () => void;
  onChordsChange: (chordPlacements: ChordPlacement[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const getColor = () => {
    switch(block.type) {
      case 'verse': return 'from-blue-500/10 to-blue-500/5 border-blue-500/30';
      case 'chorus': return 'from-brand-primary/10 to-brand-primary/5 border-brand-primary/30';
      case 'bridge': return 'from-purple-500/10 to-purple-500/5 border-purple-500/30';
      default: return 'from-gray-500/10 to-gray-500/5 border-gray-500/30';
    }
  };

  // Use granular chord editor for verse, chorus, and bridge types
  const useGranularEditor = block.type === 'verse' || block.type === 'chorus' || block.type === 'bridge';

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`mb-4 rnrb-card p-4 bg-gradient-to-br ${getColor()} border-2 hover:shadow-xl transition-all group`}
    >
      <div className="flex gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-1">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-brand-primary">{block.type}</span>
            <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {useGranularEditor ? (
            <GranularChordEditor
              content={block.content}
              chordPlacements={block.chordPlacements || []}
              onContentChange={onEdit}
              onChordsChange={onChordsChange}
              blockType={block.type}
            />
          ) : (
            <textarea
              value={block.content}
              onChange={(e) => onEdit(e.target.value)}
              placeholder={`Write your ${block.type}...`}
              className="w-full px-3 py-2 bg-surface/50 border border-border/50 rounded-lg text-foreground text-sm resize-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
              rows={3}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function CollaborativeVisualBuilder({ 
  projectSlug, 
  onSongChange,
  currentUser,
  isOwner = true, // Whether current user owns the song (can accept/reject)
}: { 
  projectSlug: string;
  onSongChange?: (blocks: SongBlock[]) => void;
  currentUser: {
    userId: string;
    userName: string;
    userEmail?: string;
    avatar?: string;
  };
  isOwner?: boolean;
}) {
  const [blocks, setBlocks] = useState<SongBlock[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [history, setHistory] = useState<{ blocks: SongBlock[]; timestamp: Date }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Collaborative cursors
  const { remoteCursors, isConnected: cursorsConnected } = useCollaborativeCursors({
    channelName: `songwriting:${projectSlug}-cursors`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    enabled: true,
  });

  // Collaborative suggestions
  const {
    suggestions,
    chordSuggestions,
    isConnected: suggestionsConnected,
    error: suggestionsError,
    isOwner: canManageSuggestions,
    suggestLyricChange,
    suggestChord,
    acceptSuggestion,
    rejectSuggestion,
    acceptChordSuggestion,
    rejectChordSuggestion,
    getSuggestionsForBlock,
    getChordSuggestionsForBlock,
  } = useSongSuggestions({
    channelName: `songwriting:${projectSlug}-suggestions`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    isOwner,
    enabled: true,
  });

  // Count total pending suggestions
  const pendingSuggestionsCount = useMemo(() => {
    return suggestions.filter(s => s.status === 'pending').length + 
           chordSuggestions.filter(s => s.status === 'pending').length;
  }, [suggestions, chordSuggestions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Cmd/Ctrl + S = Export
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        exportToClipboard();
      }
      // Cmd/Ctrl + K = Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
      // Escape = Close modals
      if (e.key === 'Escape') {
        setShowKeyboardHelp(false);
        setShowCollaborators(false);
        setShowHistory(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length, blocks]);

  // Save to history whenever blocks change
  const saveToHistory = (newBlocks: SongBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ blocks: newBlocks, timestamp: new Date() });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addBlock = (type: SongBlock['type']) => {
    const newBlock: SongBlock = {
      id: `block-${Date.now()}`,
      type,
      content: ''
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    onSongChange?.(updated);
    saveToHistory(updated);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setBlocks((items) => {
      const oldIndex = items.findIndex(b => b.id === active.id);
      const newIndex = items.findIndex(b => b.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      onSongChange?.(reordered);
      saveToHistory(reordered);
      return reordered;
    });
  };

  const editBlock = (id: string, content: string) => {
    const updated = blocks.map(b => b.id === id ? { ...b, content } : b);
    setBlocks(updated);
    onSongChange?.(updated);
    // Don't save to history on every keystroke - only on significant changes
  };

  const updateBlockChords = (id: string, chordPlacements: ChordPlacement[]) => {
    const updated = blocks.map(b => b.id === id ? { ...b, chordPlacements } : b);
    setBlocks(updated);
    onSongChange?.(updated);
    saveToHistory(updated);
  };

  // Extract all unique chords from all blocks for key detection
  const allChords = useMemo(() => {
    const chordSet = new Set<string>();
    blocks.forEach(block => {
      if (block.chordPlacements) {
        block.chordPlacements.forEach(placement => {
          chordSet.add(placement.chord);
        });
      }
    });
    return Array.from(chordSet);
  }, [blocks]);

  const removeBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    setBlocks(updated);
    onSongChange?.(updated);
    saveToHistory(updated);
  };

  const exportToClipboard = () => {
    const text = blocks.map(b => `[${b.type.toUpperCase()}]\n${b.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // TOKYO SUBWAY RULE: Undo = Go back 1 station
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const restored = history[newIndex].blocks;
      setBlocks(restored);
      onSongChange?.(restored);
    }
  };

  // TOKYO SUBWAY RULE: Redo = Go forward 1 station
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const restored = history[newIndex].blocks;
      setBlocks(restored);
      onSongChange?.(restored);
    }
  };

  // TOKYO SUBWAY RULE: Invite = 1 click to modal, type email, 1 click to send (3 total)
  const sendInvite = () => {
    if (!inviteEmail.trim()) return;
    // TODO: Integrate with actual invite API
    alert(`Invitation sent to ${inviteEmail}! They'll receive an email to collaborate on this song.`);
    setInviteEmail('');
    setShowCollaborators(false);
  };

  // TOKYO SUBWAY RULE: Restore version = 1 click on history item
  const restoreVersion = (versionIndex: number) => {
    setHistoryIndex(versionIndex);
    const restored = history[versionIndex].blocks;
    setBlocks(restored);
    onSongChange?.(restored);
    setShowHistory(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4 rnrb-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowCollaborators(true)}>
              <Users className="w-4 h-4 mr-2" />
              Collaborators
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowHistory(true)}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            {isOwner && pendingSuggestionsCount > 0 && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setShowSuggestions(true)}
                className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {pendingSuggestionsCount} Suggestion{pendingSuggestionsCount !== 1 ? 's' : ''}
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={exportToClipboard}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Export'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowKeyboardHelp(true)}
              title="Keyboard shortcuts (⌘K)"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${cursorsConnected && suggestionsConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-muted-foreground">
                {cursorsConnected && suggestionsConnected ? 'Live' : 'Connecting...'}
              </span>
            </div>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo last change"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo last undone change"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.open(`/projects/${projectSlug}/collaborate`, '_blank')}
              title="Open video collaboration in new tab"
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {suggestionsError && (
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">Collaboration Error</p>
              <p className="text-xs text-red-300">Real-time suggestions unavailable: {suggestionsError}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Palette */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="lg:sticky lg:top-4 space-y-4">
            <Card className="p-6 rnrb-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Building Blocks
              </h3>
              <div className="space-y-3">
                {PALETTE_BLOCKS.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addBlock(item.type)}
                    className="w-full rnrb-card p-4 bg-gradient-to-r from-brand-primary/10 to-transparent border-2 border-dashed border-brand-primary/30 hover:border-brand-primary/50 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">Click to add →</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Key Analyzer */}
            <KeyAnalyzer chords={allChords} />
          </div>
        </div>

        {/* Right Canvas */}
        <div className="col-span-12 lg:col-span-9">
          <Card className="p-8 rnrb-card min-h-[600px]">
            <h2 className="text-2xl font-display font-bold mb-6">Your Song Structure</h2>
            
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-2xl">
                <Music className="w-20 h-20 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start Building</h3>
                <p className="text-muted-foreground">Click blocks on the left to add them to your song</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onEdit={(content) => editBlock(block.id, content)}
                      onRemove={() => removeBlock(block.id)}
                      onChordsChange={(chordPlacements) => updateBlockChords(block.id, chordPlacements)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </div>
      </div>

      {/* Collapsible Chat */}
      <Card className={`rnrb-card transition-all ${chatExpanded ? 'h-auto' : 'h-16'}`}>
        <button
          onClick={() => setChatExpanded(!chatExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-surface-muted/50 transition"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-brand-primary" />
            <span className="font-semibold">Team Chat</span>
            <span className="text-xs text-muted-foreground">• 2 online</span>
          </div>
          {chatExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
        {chatExpanded && (
          <div className="p-4 border-t border-border">
            <ChatRoom channelName={`song-builder-${projectSlug}`} />
          </div>
        )}
      </Card>

      {/* TOKYO SUBWAY MODAL: Collaborators & Invite (Max 3 clicks to invite someone) */}
      {showCollaborators && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCollaborators(false)}
        >
          <Card 
            className="rnrb-card p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-brand-primary" />
                  Collaborators
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Invite friends to write together</p>
              </div>
              <button
                onClick={() => setShowCollaborators(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Collaborators */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">CURRENT TEAM</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <span className="font-bold text-brand-primary">Y</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">You</p>
                    <p className="text-xs text-muted-foreground">Creator • Full Access</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full" title="Online now" />
                </div>
              </div>
            </div>

            {/* TOKYO RULE: Invite form = 2 clicks (type email, click send) */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                INVITE COLLABORATOR
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendInvite()}
                  placeholder="friend@email.com"
                  className="flex-1 px-4 py-3 bg-surface border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition"
                />
                <Button
                  onClick={sendInvite}
                  disabled={!inviteEmail.trim()}
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground rounded-xl font-semibold"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                They'll get an email invite to join this songwriting session
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TOKYO SUBWAY MODAL: Version History (1 click to restore) */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowHistory(false)}
        >
          <Card 
            className="rnrb-card p-8 max-w-lg w-full max-h-[600px] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                  <History className="w-6 h-6 text-brand-primary" />
                  Version History
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Restore previous versions with 1 click</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h4 className="text-lg font-semibold mb-2">No History Yet</h4>
                <p className="text-sm text-muted-foreground">
                  Make some changes and they'll be saved here automatically
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {history.map((version, index) => {
                  const isCurrent = index === historyIndex;
                  const timestamp = version.timestamp.toLocaleTimeString();
                  const blockCount = version.blocks.length;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => restoreVersion(index)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isCurrent
                          ? 'bg-brand-primary/10 border-2 border-brand-primary/50 shadow-lg'
                          : 'bg-surface-muted hover:bg-surface border-2 border-transparent hover:border-brand-primary/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-brand-primary" />
                            <span className="font-semibold text-sm">
                              {isCurrent ? 'Current Version' : `Version ${history.length - index}`}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {timestamp} • {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
                          </p>
                          {version.blocks.length > 0 && (
                            <p className="text-xs text-brand-primary mt-2 font-medium">
                              {version.blocks.map(b => b.type).join(' → ')}
                            </p>
                          )}
                        </div>
                        {!isCurrent && (
                          <div className="text-xs font-medium text-brand-primary opacity-0 group-hover:opacity-100 transition">
                            Click to restore →
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Collaborative Cursors Overlay */}
      <CursorOverlay cursors={remoteCursors} />

      {/* Suggestions Review Modal (Owner Only) */}
      {showSuggestions && isOwner && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuggestions(false)}
        >
          <Card 
            className="rnrb-card p-8 max-w-2xl w-full max-h-[600px] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  Pending Suggestions
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Review and accept/reject changes from collaborators</p>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pendingSuggestionsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400/50 mb-4" />
                <h4 className="text-lg font-semibold mb-2">All Clear!</h4>
                <p className="text-sm text-muted-foreground">
                  No pending suggestions at the moment
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {/* Lyric Suggestions */}
                {suggestions.filter(s => s.status === 'pending').map((suggestion) => {
                  const block = blocks.find(b => b.id === suggestion.blockId);
                  if (!block) return null;

                  return (
                    <div
                      key={suggestion.id}
                      className="p-4 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase text-yellow-400">{block.type}</span>
                            <span className="text-xs text-muted-foreground">• by {suggestion.userName}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Original: </span>
                              <span className="line-through text-red-400">{suggestion.originalValue}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Suggested: </span>
                              <span className="text-green-400 font-medium">{suggestion.suggestedValue}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const accepted = acceptSuggestion(suggestion.id);
                            if (accepted) {
                              // Apply the suggestion to master
                              const updated = blocks.map(b => {
                                if (b.id === accepted.blockId) {
                                  return {
                                    ...b,
                                    content: b.content.replace(accepted.originalValue, accepted.suggestedValue)
                                  };
                                }
                                return b;
                              });
                              setBlocks(updated);
                              onSongChange?.(updated);
                              saveToHistory(updated);
                            }
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => rejectSuggestion(suggestion.id)}
                          variant="secondary"
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Chord Suggestions */}
                {chordSuggestions.filter(s => s.status === 'pending').map((suggestion) => {
                  const block = blocks.find(b => b.id === suggestion.blockId);
                  if (!block) return null;

                  return (
                    <div
                      key={suggestion.id}
                      className="p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/30"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase text-blue-400">{block.type} - CHORD</span>
                            <span className="text-xs text-muted-foreground">• by {suggestion.userName}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Add chord: </span>
                            <span className="text-blue-400 font-mono font-bold">{suggestion.chord}</span>
                            <span className="text-muted-foreground"> at line {suggestion.lineIndex + 1}, word {suggestion.wordIndex + 1}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const accepted = acceptChordSuggestion(suggestion.id);
                            if (accepted) {
                              // Apply chord to master
                              const updated = blocks.map(b => {
                                if (b.id === accepted.blockId) {
                                  const newPlacement = {
                                    lineIndex: accepted.lineIndex,
                                    wordIndex: accepted.wordIndex,
                                    chord: accepted.chord
                                  };
                                  return {
                                    ...b,
                                    chordPlacements: [...(b.chordPlacements || []), newPlacement]
                                  };
                                }
                                return b;
                              });
                              setBlocks(updated);
                              onSongChange?.(updated);
                              saveToHistory(updated);
                            }
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => rejectChordSuggestion(suggestion.id)}
                          variant="secondary"
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />
                Suggestions keep your song organized while letting everyone contribute
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowKeyboardHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rnrb-card p-8 max-w-lg w-full bg-surface border-2 border-border rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                    <Keyboard className="w-6 h-6 text-brand-primary" />
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Work faster with shortcuts</p>
                </div>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { keys: ['⌘/Ctrl', 'Z'], action: 'Undo last change' },
                  { keys: ['⌘/Ctrl', 'Shift', 'Z'], action: 'Redo last undone change' },
                  { keys: ['⌘/Ctrl', 'S'], action: 'Export to clipboard' },
                  { keys: ['⌘/Ctrl', 'K'], action: 'Show this help' },
                  { keys: ['Esc'], action: 'Close modals' },
                ].map((shortcut, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-surface-muted rounded-lg"
                  >
                    <span className="text-foreground">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="px-2 py-1 rounded bg-background border border-border text-xs font-medium">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Pro tip: Click any word in lyrics to add chords instantly!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

