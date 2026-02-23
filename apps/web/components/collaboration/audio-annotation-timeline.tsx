'use client';

/**
 * Audio Annotation Timeline Component
 *
 * Timestamped comments on the waveform.
 * Everyone can leave feedback at specific moments.
 */

import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  Check,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Circle,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';
import { useState, useRef } from 'react';

import { useAudioAnnotations, type AudioAnnotation } from '@/hooks/use-audio-annotations';

interface AudioAnnotationTimelineProps {
  channelName: string;
  userId: string;
  userName: string;
  userColor?: string;
  duration: number; // Audio duration in seconds
  currentTime: number; // Current playback position
  onSeek?: (time: number) => void;
}

export function AudioAnnotationTimeline({
  channelName,
  userId,
  userName,
  userColor,
  duration,
  currentTime,
  onSeek,
}: AudioAnnotationTimelineProps) {
  const {
    annotations,
    isConnected,
    unresolvedCount,
    createAnnotation,
    replyToAnnotation,
    toggleResolved,
    deleteAnnotation,
  } = useAudioAnnotations({
    channelName,
    userId,
    userName,
    userColor,
  });

  const [newComment, setNewComment] = useState('');
  const [expandedAnnotation, setExpandedAnnotation] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showAll, setShowAll] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    createAnnotation(currentTime, newComment);
    setNewComment('');
  };

  const handleReply = (annotationId: string) => {
    if (!replyText.trim()) return;
    replyToAnnotation(annotationId, replyText);
    setReplyText('');
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !onSeek) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    onSeek(time);
  };

  const displayedAnnotations = showAll
    ? annotations
    : annotations.filter((a) => !a.resolved).slice(0, 5);

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent-soft)' }}
          >
            <MessageSquare className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              Timeline Comments
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {isConnected ? (
                <>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                  {annotations.length} comments ({unresolvedCount} unresolved)
                </>
              ) : (
                'Connecting...'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative mb-6 h-12 cursor-pointer rounded-xl"
        style={{ background: 'var(--bg)' }}
        onClick={handleTimelineClick}
      >
        {/* Progress indicator */}
        <div
          className="absolute left-0 top-0 h-full rounded-l-xl"
          style={{
            width: `${(currentTime / duration) * 100}%`,
            background: 'var(--accent-soft)',
          }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 h-full w-0.5"
          style={{
            left: `${(currentTime / duration) * 100}%`,
            background: 'var(--accent)',
          }}
        />

        {/* Annotation markers */}
        {annotations.map((annotation) => (
          <button
            key={annotation.id}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
            style={{
              left: `${(annotation.timestamp / duration) * 100}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedAnnotation(expandedAnnotation === annotation.id ? null : annotation.id);
              if (onSeek) onSeek(annotation.timestamp);
            }}
            title={`${annotation.userName}: ${annotation.content}`}
          >
            <div
              className="h-4 w-4 rounded-full border-2"
              style={{
                background: annotation.resolved ? 'var(--muted)' : annotation.userColor,
                borderColor: 'var(--panel)',
              }}
            />
          </button>
        ))}

        {/* Time markers */}
        <div className="absolute bottom-1 left-2 text-xs" style={{ color: 'var(--muted)' }}>
          {formatTime(0)}
        </div>
        <div className="absolute bottom-1 right-2 text-xs" style={{ color: 'var(--muted)' }}>
          {formatTime(duration)}
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder={`Add comment at ${formatTime(currentTime)}...`}
            className="w-full rounded-xl px-4 py-3 pr-24 text-sm"
            style={{
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs"
            style={{ color: 'var(--muted)' }}
          >
            {formatTime(currentTime)}
          </span>
        </div>
        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Annotations List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayedAnnotations.map((annotation) => (
            <motion.div
              key={annotation.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                opacity: annotation.resolved ? 0.6 : 1,
              }}
            >
              {/* Main Comment */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{ background: annotation.userColor }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {annotation.userName}
                    </span>
                    <button
                      onClick={() => onSeek?.(annotation.timestamp)}
                      className="rounded-md px-2 py-0.5 font-mono text-xs hover:opacity-80"
                      style={{ background: 'var(--panel)', color: 'var(--accent)' }}
                    >
                      {formatTime(annotation.timestamp)}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleResolved(annotation.id)}
                      className="rounded p-1 hover:opacity-80"
                      style={{ color: annotation.resolved ? 'var(--success)' : 'var(--muted)' }}
                      title={annotation.resolved ? 'Unresolve' : 'Mark resolved'}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    {annotation.userId === userId && (
                      <button
                        onClick={() => deleteAnnotation(annotation.id)}
                        className="rounded p-1 hover:opacity-80"
                        style={{ color: 'var(--error)' }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setExpandedAnnotation(
                          expandedAnnotation === annotation.id ? null : annotation.id
                        )
                      }
                      className="rounded p-1"
                      style={{ color: 'var(--muted)' }}
                    >
                      {expandedAnnotation === annotation.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p
                  className="text-sm"
                  style={{
                    color: 'var(--text)',
                    textDecoration: annotation.resolved ? 'line-through' : 'none',
                  }}
                >
                  {annotation.content}
                </p>
                {annotation.replies.length > 0 && (
                  <span className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                    {annotation.replies.length}{' '}
                    {annotation.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>

              {/* Expanded Replies */}
              <AnimatePresence>
                {expandedAnnotation === annotation.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    {/* Replies */}
                    {annotation.replies.length > 0 && (
                      <div className="space-y-2 p-4">
                        {annotation.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="rounded-lg p-3"
                            style={{ background: 'var(--panel)' }}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <Circle className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                              <span
                                className="text-xs font-medium"
                                style={{ color: 'var(--text)' }}
                              >
                                {reply.userName}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="flex gap-2 p-4 pt-0">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReply(annotation.id)}
                        placeholder="Reply..."
                        className="flex-1 rounded-lg px-3 py-2 text-sm"
                        style={{
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleReply(annotation.id)}
                        disabled={!replyText.trim()}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show All Toggle */}
      {annotations.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full rounded-xl py-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ background: 'var(--bg)', color: 'var(--accent)' }}
        >
          {showAll ? 'Show Less' : `Show All (${annotations.length})`}
        </button>
      )}
    </div>
  );
}
