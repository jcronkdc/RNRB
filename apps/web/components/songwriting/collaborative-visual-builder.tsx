'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Music, Sparkles, GripVertical, Plus, X, Users, Save, Download, 
  History, Undo, Redo, Video, MessageSquare, ChevronUp, ChevronDown,
  Tag, Copy, Check
} from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dynamic from 'next/dynamic';

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
  onSongChange 
}: { 
  projectSlug: string;
  onSongChange: (blocks: SongBlock[]) => void 
}) {
  const [blocks, setBlocks] = useState<SongBlock[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const addBlock = (type: SongBlock['type']) => {
    const newBlock: SongBlock = {
      id: `block-${Date.now()}`,
      type,
      content: ''
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    onSongChange(updated);
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
      return reordered;
    });
  };

  const editBlock = (id: string, content: string) => {
    const updated = blocks.map(b => b.id === id ? { ...b, content } : b);
    setBlocks(updated);
    onSongChange(updated);
  };

  const removeBlock = (id: string) => {
    const updated = blocks.filter(b => b.id !== id);
    setBlocks(updated);
    onSongChange(updated);
  };

  const exportToClipboard = () => {
    const text = blocks.map(b => `[${b.type.toUpperCase()}]\n${b.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <Button size="sm" variant="secondary">
              <Undo className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary">
              <Redo className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
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
    </div>
  );
}

