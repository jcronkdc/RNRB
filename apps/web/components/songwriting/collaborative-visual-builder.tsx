'use client';

import {
  AlertCircle,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  GripVertical,
  History,
  Keyboard,
  Mail,
  MessageSquare,
  Music,
  Redo,
  Sparkles,
  Undo,
  UserPlus,
  Users,
  Video,
  X,
  XCircle,
} from '@/components/ui/custom-icons';
import { Button, Card } from '@cronkwaters/ui';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import {
  Component,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

// Error boundary to catch Ably-related errors gracefully
class CollaborativeErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Log but don't crash - this is expected when Ably isn't connected
    if (process.env.NODE_ENV === 'development') {
      console.warn('Collaborative features unavailable:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.props.children;
    }
    return this.props.children;
  }
}

import { GranularChordEditor } from './granular-chord-editor';
import { KeyAnalyzer } from './key-analyzer';

import { CursorOverlay } from '@/components/cursor-overlay';
import { useBlockEditing } from '@/hooks/use-block-editing';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { useSongSuggestions } from '@/hooks/use-song-suggestions';
import { formatTime } from '@/lib/format-date';

// Dynamically import chat with loading state
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then((m) => m.ChatRoom), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
    </div>
  ),
});

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
  { type: 'verse' as const, label: 'Verse', icon: '', color: 'blue' },
  { type: 'chorus' as const, label: 'Chorus', icon: '', color: 'gold' },
  { type: 'bridge' as const, label: 'Bridge', icon: '', color: 'purple' },
];

// Memoized sortable block component for better performance
const SortableBlock = memo(function SortableBlock({
  block,
  onEdit,
  onRemove,
  onChordsChange,
  editor,
  onFocus,
  onBlur,
}: {
  block: SongBlock;
  onEdit: (content: string) => void;
  onRemove: () => void;
  onChordsChange: (chordPlacements: ChordPlacement[]) => void;
  editor?: { userName: string; userColor: string };
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const getColor = () => {
    switch (block.type) {
      case 'verse':
        return 'bg-zinc-900/50 border-zinc-800';
      case 'chorus':
        return 'bg-zinc-900/50 border-zinc-700';
      case 'bridge':
        return 'bg-zinc-900/50 border-zinc-800';
      default:
        return 'bg-zinc-900/50 border-zinc-800';
    }
  };

  // Use granular chord editor for verse, chorus, and bridge types
  const useGranularEditor =
    block.type === 'verse' || block.type === 'chorus' || block.type === 'bridge';

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        ...(editor && { borderColor: editor.userColor, outlineColor: editor.userColor }),
      }}
      className={`rnrb-card group relative mb-4 rounded p-4 transition-all hover:shadow-xl ${getColor()} border ${
        editor ? 'outline-2 outline-offset-2 outline-solid' : ''
      }`}
    >
      {/* Active Editor Indicator */}
      {editor && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-3 left-4 flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-lg"
          style={{
            borderColor: editor.userColor,
            backgroundColor: `${editor.userColor}20`,
            color: editor.userColor,
          }}
        >
          <div
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: editor.userColor }}
          />
          <span>{editor.userName} is editing</span>
        </motion.div>
      )}

      <div className="flex gap-3">
        <div {...attributes} {...listeners} className="cursor-grab pt-1 active:cursor-grabbing">
          <GripVertical className="text-muted-foreground h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-brand-primary text-xs font-bold tracking-wide uppercase">
              {block.type}
            </span>
            <button
              onClick={onRemove}
              className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
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
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={`Write your ${block.type}...`}
              className="border-border/50 bg-surface/50 text-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-hidden focus:ring-2"
              rows={3}
            />
          )}
        </div>
      </div>
    </div>
  );
});

// Props type for the component
type CollaborativeVisualBuilderProps = {
  projectSlug: string;
  onSongChange?: (blocks: SongBlock[]) => void;
  currentUser: {
    userId: string;
    userName: string;
    userEmail?: string;
    avatar?: string;
  };
  isOwner?: boolean;
};

// Inner component that uses the Ably hooks
function CollaborativeVisualBuilderInner({
  projectSlug,
  onSongChange,
  currentUser,
  isOwner = true, // Whether current user owns the song (can accept/reject)
}: CollaborativeVisualBuilderProps) {
  const [blocks, setBlocks] = useState<SongBlock[]>([]);
  const [_activeId, setActiveId] = useState<string | null>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ blocks: SongBlock[]; timestamp: Date }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Use refs for keyboard handlers to avoid stale closures
  const blocksRef = useRef<SongBlock[]>(blocks);
  const historyRef = useRef<{ blocks: SongBlock[]; timestamp: Date }[]>(history);
  const historyIndexRef = useRef<number>(historyIndex);

  // Keep refs in sync
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Memoize sensors to prevent recreation on every render
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Collaborative cursors - RE-ENABLED with shared Ably client
  // Uses the official ably/react hooks which consume the shared AblyProvider client
  const { remoteCursors, isConnected: cursorsConnected } = useCollaborativeCursors({
    channelName: `songwriting:${projectSlug}-cursors`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    enabled: true, // Now safe - AblyProvider handles connection
  });

  // Block editing tracking
  const {
    activeEditors,
    userColor: _userColor,
    notifyEditing,
    notifyStopEditing,
  } = useBlockEditing({
    channelName: `songwriting:${projectSlug}-editing`,
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
    isOwner: _canManageSuggestions,
    suggestLyricChange: _suggestLyricChange,
    suggestChord: _suggestChord,
    acceptSuggestion,
    rejectSuggestion,
    acceptChordSuggestion,
    rejectChordSuggestion,
    getSuggestionsForBlock: _getSuggestionsForBlock,
    getChordSuggestionsForBlock: _getChordSuggestionsForBlock,
  } = useSongSuggestions({
    channelName: `songwriting:${projectSlug}-suggestions`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    isOwner,
    enabled: true,
  });

  // Count total pending suggestions
  const pendingSuggestionsCount = useMemo(() => {
    return (
      suggestions.filter((s) => s.status === 'pending').length +
      chordSuggestions.filter((s) => s.status === 'pending').length
    );
  }, [suggestions, chordSuggestions]);

  // Keyboard shortcuts - uses refs to avoid stale closures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z = Undo (using refs to get current values)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (historyIndexRef.current > 0) {
          const newIndex = historyIndexRef.current - 1;
          setHistoryIndex(newIndex);
          const restored = historyRef.current[newIndex].blocks;
          setBlocks(restored);
          onSongChange?.(restored);
        }
      }
      // Cmd/Ctrl + Shift + Z = Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (historyIndexRef.current < historyRef.current.length - 1) {
          const newIndex = historyIndexRef.current + 1;
          setHistoryIndex(newIndex);
          const restored = historyRef.current[newIndex].blocks;
          setBlocks(restored);
          onSongChange?.(restored);
        }
      }
      // Cmd/Ctrl + S = Export
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        const text = blocksRef.current
          .map((b) => `[${b.type.toUpperCase()}]\n${b.content}`)
          .join('\n\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
  }, [onSongChange]); // Only onSongChange callback as dependency

  // Memoize callbacks to prevent recreation
  const saveToHistory = useCallback(
    (newBlocks: SongBlock[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push({ blocks: newBlocks, timestamp: new Date() });
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  const addBlock = useCallback(
    (type: SongBlock['type']) => {
      const newBlock: SongBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        content: '',
      };
      setBlocks((prev) => {
        const updated = [...prev, newBlock];
        onSongChange?.(updated);
        saveToHistory(updated);
        return updated;
      });
    },
    [onSongChange, saveToHistory]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over || active.id === over.id) return;

      setBlocks((items) => {
        const oldIndex = items.findIndex((b) => b.id === active.id);
        const newIndex = items.findIndex((b) => b.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        onSongChange?.(reordered);
        saveToHistory(reordered);
        return reordered;
      });
    },
    [onSongChange, saveToHistory]
  );

  // Debounced history save for content edits — captures state after 1s of inactivity
  const editHistoryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const editBlock = (id: string, content: string) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, content } : b));
    setBlocks(updated);
    onSongChange?.(updated);
    // Notify editing
    notifyEditing(id);
    // Debounced save to history — captures state after user pauses typing
    if (editHistoryTimerRef.current) {
      clearTimeout(editHistoryTimerRef.current);
    }
    editHistoryTimerRef.current = setTimeout(() => {
      saveToHistory(updated);
    }, 1000);
  };

  const updateBlockChords = (id: string, chordPlacements: ChordPlacement[]) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, chordPlacements } : b));
    setBlocks(updated);
    onSongChange?.(updated);
    saveToHistory(updated);
    // Notify editing
    notifyEditing(id);
  };

  // Extract all unique chords from all blocks for key detection
  const allChords = useMemo(() => {
    const chordSet = new Set<string>();
    blocks.forEach((block) => {
      if (block.chordPlacements) {
        block.chordPlacements.forEach((placement) => {
          chordSet.add(placement.chord);
        });
      }
    });
    return Array.from(chordSet);
  }, [blocks]);

  const removeBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    onSongChange?.(updated);
    saveToHistory(updated);
  };

  const exportToClipboard = () => {
    const text = blocks.map((b) => `[${b.type.toUpperCase()}]\n${b.content}`).join('\n\n');
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
  const sendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return;

    setInviteStatus('sending');
    setInviteError(null);

    try {
      const response = await fetch(`/api/projects/${projectSlug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: 'member' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteStatus('sent');
      setInviteEmail('');
      setTimeout(() => {
        setInviteStatus('idle');
        setShowCollaborators(false);
      }, 2000);
    } catch (err) {
      setInviteStatus('error');
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    }
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
      <Card className="rnrb-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowCollaborators(true)}>
              <Users className="mr-2 h-4 w-4" />
              Collaborators
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowHistory(true)}>
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            {isOwner && pendingSuggestionsCount > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowSuggestions(true)}
                className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                {pendingSuggestionsCount} Suggestion{pendingSuggestionsCount !== 1 ? 's' : ''}
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={exportToClipboard}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Export'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowKeyboardHelp(true)}
              title="Keyboard shortcuts (⌘K)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`h-2 w-2 rounded-full ${cursorsConnected && suggestionsConnected ? 'bg-green-400' : 'bg-yellow-400'}`}
              />
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
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo last undone change"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => window.open(`/projects/${projectSlug}/collaborate`, '_blank')}
              title="Open video collaboration in new tab"
            >
              <Video className="mr-2 h-4 w-4" />
              Video
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Banner */}
      {suggestionsError && (
        <Card className="border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-400">Collaboration Error</p>
              <p className="text-xs text-red-300">
                Real-time suggestions unavailable: {suggestionsError}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Palette */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          <div className="space-y-4 lg:sticky lg:top-4">
            <Card className="rnrb-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Building Blocks
              </h3>
              <div className="space-y-3">
                {PALETTE_BLOCKS.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addBlock(item.type)}
                    className="rnrb-card w-full rounded border border-zinc-800 bg-zinc-900/50 p-4 text-left transition-all hover:border-zinc-700 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <p className="text-foreground font-semibold">{item.label}</p>
                        <p className="text-muted-foreground text-xs">Click to add →</p>
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
          <Card className="rnrb-card min-h-[600px] p-8">
            <h2 className="font-display mb-6 text-2xl font-bold">Your Song Structure</h2>

            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded border border-zinc-800 bg-zinc-900/50 py-24">
                <Music className="mb-4 h-12 w-12 text-zinc-600" />
                <p className="font-mono text-sm tracking-wider text-zinc-400 uppercase">
                  Click a block above to start
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {blocks.map((block) => {
                    const editor = activeEditors[block.id];
                    return (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        onEdit={(content) => editBlock(block.id, content)}
                        onRemove={() => removeBlock(block.id)}
                        onChordsChange={(chordPlacements) =>
                          updateBlockChords(block.id, chordPlacements)
                        }
                        editor={editor}
                        onFocus={() => notifyEditing(block.id)}
                        onBlur={() => notifyStopEditing(block.id)}
                      />
                    );
                  })}
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
          className="hover:bg-surface-muted/50 flex w-full items-center justify-between p-4 transition"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="text-brand-primary h-5 w-5" />
            <span className="font-semibold">Team Chat</span>
            <span className="text-muted-foreground text-xs">
              • {remoteCursors.length + 1} online
            </span>
          </div>
          {chatExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>
        {chatExpanded && (
          <div className="border-border border-t p-4">
            <ChatRoom channelName={`song-builder-${projectSlug}`} />
          </div>
        )}
      </Card>

      {/* TOKYO SUBWAY MODAL: Collaborators & Invite (Max 3 clicks to invite someone) */}
      {showCollaborators && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowCollaborators(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowCollaborators(false)}
        >
          <Card className="rnrb-card w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display flex items-center gap-2 text-2xl font-bold">
                  <Users className="text-brand-primary h-6 w-6" />
                  Collaborators
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Invite friends to write together
                </p>
              </div>
              <button
                onClick={() => setShowCollaborators(false)}
                className="text-muted-foreground hover:bg-surface-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Collaborators */}
            <div className="mb-6">
              <h4 className="text-muted-foreground mb-3 text-sm font-semibold">CURRENT TEAM</h4>
              <div className="space-y-2">
                <div className="bg-surface-muted flex items-center gap-3 rounded-lg p-3">
                  <div className="bg-brand-primary/20 flex h-10 w-10 items-center justify-center rounded-full">
                    <span className="text-brand-primary font-bold">Y</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">You</p>
                    <p className="text-muted-foreground text-xs">Creator • Full Access</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-400" title="Online now" />
                </div>
              </div>
            </div>

            {/* TOKYO RULE: Invite form = 2 clicks (type email, click send) */}
            <div className="border-border border-t pt-6">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <UserPlus className="h-4 w-4 text-purple-400" />
                INVITE COLLABORATOR
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                  placeholder="friend@email.com"
                  className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/10 flex-1 rounded-xl border-2 px-4 py-3 outline-hidden transition focus:ring-4"
                />
                <Button
                  onClick={sendInvite}
                  disabled={!inviteEmail.trim() || inviteStatus === 'sending'}
                  className="bg-brand-primary text-brand-primary-foreground hover:bg-brand-primary/90 rounded-xl px-6 py-3 font-semibold"
                >
                  {inviteStatus === 'sending' ? (
                    <>Sending...</>
                  ) : inviteStatus === 'sent' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              {inviteStatus === 'error' && inviteError && (
                <p className="mt-2 text-xs text-red-400">{inviteError}</p>
              )}
              <p className="text-muted-foreground mt-3 flex items-center gap-1 text-xs">
                <Sparkles className="h-3 w-3 text-purple-400" />
                They&apos;ll get an email invite to join this songwriting session
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* TOKYO SUBWAY MODAL: Version History (1 click to restore) */}
      {showHistory && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowHistory(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowHistory(false)}
        >
          <Card
            className="rnrb-card flex max-h-[600px] w-full max-w-lg flex-col overflow-hidden p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display flex items-center gap-2 text-2xl font-bold">
                  <History className="text-brand-primary h-6 w-6" />
                  Version History
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Restore previous versions with 1 click
                </p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:bg-surface-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="text-muted-foreground/50 mb-4 h-16 w-16" />
                <h4 className="mb-2 text-lg font-semibold">No History Yet</h4>
                <p className="text-muted-foreground text-sm">
                  Make some changes and they&apos;ll be saved here automatically
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                {history.map((version, index) => {
                  const isCurrent = index === historyIndex;
                  const timestamp = formatTime(version.timestamp);
                  const blockCount = version.blocks.length;

                  return (
                    <button
                      key={index}
                      onClick={() => restoreVersion(index)}
                      className={`w-full rounded-xl p-4 text-left transition-all ${
                        isCurrent
                          ? 'border-brand-primary/50 bg-brand-primary/10 border-2 shadow-lg'
                          : 'bg-surface-muted hover:border-brand-primary/30 hover:bg-surface border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Clock className="text-brand-primary h-4 w-4" />
                            <span className="text-sm font-semibold">
                              {isCurrent ? 'Current Version' : `Version ${history.length - index}`}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {timestamp} • {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
                          </p>
                          {version.blocks.length > 0 && (
                            <p className="text-brand-primary mt-2 text-xs font-medium">
                              {version.blocks.map((b) => b.type).join(' → ')}
                            </p>
                          )}
                        </div>
                        {!isCurrent && (
                          <div className="text-brand-primary text-xs font-medium opacity-0 transition group-hover:opacity-100">
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
          role="button"
          tabIndex={0}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowSuggestions(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowSuggestions(false)}
        >
          <Card
            className="rnrb-card flex max-h-[600px] w-full max-w-2xl flex-col overflow-hidden p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display flex items-center gap-2 text-2xl font-bold">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                  Pending Suggestions
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Review and accept/reject changes from collaborators
                </p>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-muted-foreground hover:bg-surface-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {pendingSuggestionsCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="mb-4 h-16 w-16 text-green-400/50" />
                <h4 className="mb-2 text-lg font-semibold">All Clear!</h4>
                <p className="text-muted-foreground text-sm">
                  No pending suggestions at the moment
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {/* Lyric Suggestions */}
                {suggestions
                  .filter((s) => s.status === 'pending')
                  .map((suggestion) => {
                    const block = blocks.find((b) => b.id === suggestion.blockId);
                    if (!block) return null;

                    return (
                      <div
                        key={suggestion.id}
                        className="rounded-xl border-2 border-yellow-500/30 bg-yellow-500/10 p-4"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs font-bold text-yellow-400 uppercase">
                                {block.type}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                • by {suggestion.userName}
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Original: </span>
                                <span className="text-red-400 line-through">
                                  {suggestion.originalValue}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Suggested: </span>
                                <span className="font-medium text-green-400">
                                  {suggestion.suggestedValue}
                                </span>
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
                                const updated = blocks.map((b) => {
                                  if (b.id === accepted.blockId) {
                                    return {
                                      ...b,
                                      content: b.content.replace(
                                        accepted.originalValue,
                                        accepted.suggestedValue
                                      ),
                                    };
                                  }
                                  return b;
                                });
                                setBlocks(updated);
                                onSongChange?.(updated);
                                saveToHistory(updated);
                              }
                            }}
                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => rejectSuggestion(suggestion.id)}
                            variant="secondary"
                            className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                {/* Chord Suggestions */}
                {chordSuggestions
                  .filter((s) => s.status === 'pending')
                  .map((suggestion) => {
                    const block = blocks.find((b) => b.id === suggestion.blockId);
                    if (!block) return null;

                    return (
                      <div
                        key={suggestion.id}
                        className="rounded-xl border-2 border-blue-500/30 bg-blue-500/10 p-4"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs font-bold text-blue-400 uppercase">
                                {block.type} - CHORD
                              </span>
                              <span className="text-muted-foreground text-xs">
                                • by {suggestion.userName}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Add chord: </span>
                              <span className="font-mono font-bold text-blue-400">
                                {suggestion.chord}
                              </span>
                              <span className="text-muted-foreground">
                                {' '}
                                at line {suggestion.lineIndex + 1}, word {suggestion.wordIndex + 1}
                              </span>
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
                                const updated = blocks.map((b) => {
                                  if (b.id === accepted.blockId) {
                                    const newPlacement = {
                                      lineIndex: accepted.lineIndex,
                                      wordIndex: accepted.wordIndex,
                                      chord: accepted.chord,
                                    };
                                    return {
                                      ...b,
                                      chordPlacements: [...(b.chordPlacements || []), newPlacement],
                                    };
                                  }
                                  return b;
                                });
                                setBlocks(updated);
                                onSongChange?.(updated);
                                saveToHistory(updated);
                              }
                            }}
                            className="flex-1 bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => rejectChordSuggestion(suggestion.id)}
                            variant="secondary"
                            className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="border-border mt-6 border-t pt-6">
              <p className="text-muted-foreground text-center text-xs">
                <Sparkles className="mr-1 inline h-3 w-3 text-purple-400" />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowKeyboardHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="rnrb-card border-border bg-surface w-full max-w-lg rounded-2xl border-2 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display flex items-center gap-2 text-2xl font-bold">
                    <Keyboard className="text-brand-primary h-6 w-6" />
                    Keyboard Shortcuts
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">Work faster with shortcuts</p>
                </div>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="text-muted-foreground hover:bg-surface-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition"
                  aria-label="Close keyboard shortcuts"
                >
                  <X className="h-5 w-5" />
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
                    className="bg-surface-muted flex items-center justify-between rounded-lg p-3"
                  >
                    <span className="text-foreground">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <kbd className="border-border bg-background rounded border px-2 py-1 text-xs font-medium">
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

              <div className="border-border mt-6 border-t pt-6">
                <p className="text-muted-foreground flex items-center justify-center gap-2 text-center text-xs">
                  <Sparkles className="h-3 w-3 text-purple-400" />
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

// Exported component wrapped with error boundary
// Note: Collaborative cursors are temporarily disabled
export function CollaborativeVisualBuilder(props: CollaborativeVisualBuilderProps) {
  return (
    <CollaborativeErrorBoundary>
      <CollaborativeVisualBuilderInner {...props} />
    </CollaborativeErrorBoundary>
  );
}
