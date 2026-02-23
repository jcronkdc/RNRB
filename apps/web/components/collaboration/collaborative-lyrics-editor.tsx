'use client';

/**
 * Collaborative Lyrics Editor Component
 *
 * CRDT-inspired real-time lyrics co-editing.
 * Like Google Docs but for lyrics!
 */

import { motion, AnimatePresence } from 'motion/react';
import { Users, Lock, Unlock, Lightbulb, Check, X, Type } from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';
import { useState, useRef, useEffect } from 'react';

import {
  useCollaborativeLyrics,
  type CursorInfo,
  type SectionLock,
  type LyricSuggestion,
} from '@/hooks/use-collaborative-lyrics';

interface CollaborativeLyricsEditorProps {
  channelName: string;
  userId: string;
  userName: string;
  userColor?: string;
  initialContent?: string;
  placeholder?: string;
  onContentChange?: (content: string) => void;
}

export function CollaborativeLyricsEditor({
  channelName,
  userId,
  userName,
  userColor,
  initialContent = '',
  placeholder = 'Start writing lyrics...',
  onContentChange,
}: CollaborativeLyricsEditorProps) {
  const {
    content,
    setContent,
    remoteCursors,
    sectionLocks,
    suggestions,
    isConnected,
    broadcastCursor,
    lockSection,
    unlockSection,
    createSuggestion,
    respondToSuggestion,
    userColor: myColor,
  } = useCollaborativeLyrics({
    channelName,
    userId,
    userName,
    userColor,
    initialContent,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [showSuggestionInput, setShowSuggestionInput] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');

  // Notify parent of content changes
  useEffect(() => {
    if (onContentChange) {
      onContentChange(content);
    }
  }, [content, onContentChange]);

  // Handle text input
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setContent(newContent, cursorPosition);
  };

  // Track cursor/selection changes
  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      setSelection({ start, end });
    } else {
      setSelection(null);
    }

    broadcastCursor(start, start !== end ? { start, end } : undefined);
  };

  // Create suggestion from selection
  const handleCreateSuggestion = () => {
    if (!selection || !suggestionText.trim()) return;

    const originalText = content.slice(selection.start, selection.end);
    createSuggestion(selection.start, originalText, suggestionText);
    setSuggestionText('');
    setShowSuggestionInput(false);
    setSelection(null);
  };

  // Calculate cursor position in textarea coordinates
  const getCursorStyle = (cursor: CursorInfo) => {
    const textarea = textareaRef.current;
    if (!textarea) return {};

    // Simple approximation - in production you'd use a more sophisticated approach
    const lineHeight = 24;
    const charWidth = 9;
    const lines = content.slice(0, cursor.position).split('\n');
    const currentLine = lines.length - 1;
    const currentCol = lines[lines.length - 1].length;

    return {
      top: currentLine * lineHeight + 12,
      left: currentCol * charWidth + 16,
    };
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');

  return (
    <div
      className="rounded-2xl"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <Type className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <span className="font-medium" style={{ color: 'var(--text)' }}>
            Collaborative Lyrics
          </span>
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-zinc-500'}`}
          />
        </div>

        {/* Active Users */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: 'var(--muted)' }} />
          <div className="flex -space-x-2">
            {/* Current user */}
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium"
              style={{
                background: myColor,
                borderColor: 'var(--panel)',
                color: 'white',
              }}
              title={`${userName} (You)`}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            {/* Remote users */}
            {remoteCursors.map((cursor) => (
              <div
                key={cursor.userId}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium"
                style={{
                  background: cursor.userColor,
                  borderColor: 'var(--panel)',
                  color: 'white',
                }}
                title={cursor.userName}
              >
                {cursor.userName.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative">
        {/* Remote Cursors */}
        <AnimatePresence>
          {remoteCursors.map((cursor) => {
            const style = getCursorStyle(cursor);
            return (
              <motion.div
                key={cursor.userId}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="pointer-events-none absolute z-10"
                style={{
                  ...style,
                }}
              >
                {/* Cursor line */}
                <div className="h-6 w-0.5" style={{ background: cursor.userColor }} />
                {/* Name tag */}
                <div
                  className="-translate-y-full whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                  style={{ background: cursor.userColor }}
                >
                  {cursor.userName}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onClick={handleSelectionChange}
          placeholder={placeholder}
          className="min-h-[400px] w-full resize-none p-6 font-mono text-base leading-relaxed focus:outline-none"
          style={{
            background: 'transparent',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Suggestion Input (when text selected) */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-6 mb-4 rounded-xl p-4"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Suggest an edit
              </span>
            </div>
            <p className="mb-2 text-sm" style={{ color: 'var(--muted)' }}>
              Selected: "{content.slice(selection.start, selection.end)}"
            </p>
            {showSuggestionInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateSuggestion()}
                  placeholder="Suggest replacement..."
                  className="flex-1 rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleCreateSuggestion}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowSuggestionInput(false);
                    setSuggestionText('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowSuggestionInput(true)}>
                <Lightbulb className="mr-2 h-4 w-4" />
                Suggest Change
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Suggestions */}
      {pendingSuggestions.length > 0 && (
        <div
          className="mx-6 mb-6 space-y-2"
          style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}
        >
          <h4 className="mb-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
            Pending Suggestions ({pendingSuggestions.length})
          </h4>
          {pendingSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="rounded-xl p-4"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-full"
                  style={{ background: suggestion.userColor }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {suggestion.userName}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  suggests
                </span>
              </div>
              <div className="mb-3 flex items-center gap-2 text-sm">
                <span
                  className="rounded px-2 py-1 line-through"
                  style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                >
                  {suggestion.originalText}
                </span>
                <span style={{ color: 'var(--muted)' }}>→</span>
                <span
                  className="rounded px-2 py-1"
                  style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}
                >
                  {suggestion.suggestedText}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => respondToSuggestion(suggestion.id, true)}
                  style={{ background: 'var(--success)' }}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => respondToSuggestion(suggestion.id, false)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Locks */}
      {sectionLocks.length > 0 && (
        <div
          className="mx-6 mb-6 flex flex-wrap gap-2"
          style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}
        >
          {sectionLocks.map((lock) => (
            <div
              key={lock.sectionId}
              className="flex items-center gap-2 rounded-full px-3 py-1 text-xs"
              style={{
                background: `${lock.userColor}20`,
                border: `1px solid ${lock.userColor}`,
              }}
            >
              <Lock className="h-3 w-3" style={{ color: lock.userColor }} />
              <span style={{ color: lock.userColor }}>
                {lock.userName} is editing {lock.sectionId}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {content.length} characters • {content.split('\n').length} lines
        </span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {remoteCursors.length + 1} {remoteCursors.length + 1 === 1 ? 'editor' : 'editors'} online
        </span>
      </div>
    </div>
  );
}
