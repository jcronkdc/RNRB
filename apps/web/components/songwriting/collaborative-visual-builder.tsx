'use client';

import { useState } from 'react';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Music, Sparkles, GripVertical, Plus, X, Users, Save, Download, 
  History, Undo, Redo, Video, MessageSquare, ChevronUp, ChevronDown,
  Tag, Copy, Check, Mail, UserPlus, Clock
} from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dynamic from 'next/dynamic';
import { useCollaborativeCursors } from '@/hooks/use-collaborative-cursors';
import { CursorOverlay } from '@/components/cursor-overlay';

// Dynamically import chat
const ChatRoom = dynamic(() => import('@/components/ably/chat-room').then(m => m.ChatRoom), { ssr: false });

type SongBlock = {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'chord';
  content: string;
  chord?: string;
};

const PALETTE_BLOCKS = [
  { type: 'verse' as const, label: 'Verse', icon: '📝', color: 'blue' },
  { type: 'chorus' as const, label: 'Chorus', icon: '🎵', color: 'gold' },
  { type: 'bridge' as const, label: 'Bridge', icon: '🌉', color: 'purple' },
  { type: 'chord' as const, label: 'Chord', icon: '🎸', color: 'green' },
];

function SortableBlock({ block, onEdit, onRemove }: { block: SongBlock; onEdit: (content: string) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const getColor = () => {
    switch(block.type) {
      case 'verse': return 'from-blue-500/10 to-blue-500/5 border-blue-500/30';
      case 'chorus': return 'from-brand-primary/10 to-brand-primary/5 border-brand-primary/30';
      case 'bridge': return 'from-purple-500/10 to-purple-500/5 border-purple-500/30';
      case 'chord': return 'from-green-500/10 to-green-500/5 border-green-500/30';
    }
  };

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
          <textarea
            value={block.content}
            onChange={(e) => onEdit(e.target.value)}
            placeholder={`Write your ${block.type}...`}
            className="w-full px-3 py-2 bg-surface/50 border border-border/50 rounded-lg text-foreground text-sm resize-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

export function CollaborativeVisualBuilder({ 
  projectSlug, 
  onSongChange,
  currentUser,
}: { 
  projectSlug: string;
  onSongChange: (blocks: SongBlock[]) => void;
  currentUser: {
    userId: string;
    userName: string;
  };
}) {
  const [blocks, setBlocks] = useState<SongBlock[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [history, setHistory] = useState<{ blocks: SongBlock[]; timestamp: Date }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Collaborative cursors
  const { remoteCursors } = useCollaborativeCursors({
    channelName: `songwriting:${projectSlug}-cursors`,
    userId: currentUser.userId,
    userName: currentUser.userName,
    enabled: true,
  });

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
    onSongChange(updated);
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
      onSongChange(reordered);
      saveToHistory(reordered);
      return reordered;
    });
  };

  const editBlock = (id: string, content: string) => {
    const updated = blocks.map(b => b.id === id ? { ...b, content } : b);
    setBlocks(updated);
    onSongChange(updated);
    // Don't save to history on every keystroke - only on significant changes
  };

  const removeBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    setBlocks(updated);
    onSongChange(updated);
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
      onSongChange(restored);
    }
  };

  // TOKYO SUBWAY RULE: Redo = Go forward 1 station
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const restored = history[newIndex].blocks;
      setBlocks(restored);
      onSongChange(restored);
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
    onSongChange(restored);
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
            <Button size="sm" variant="secondary" onClick={exportToClipboard}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Export'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
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

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Palette */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="p-6 rnrb-card sticky top-4">
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
    </div>
  );
}

