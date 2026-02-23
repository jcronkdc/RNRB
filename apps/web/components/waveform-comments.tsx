'use client';

/**
 * Waveform Comments - Time-Stamped Feedback on Audio
 *
 * Professional studio engineer feature:
 * - Click on waveform to add feedback at specific timestamp
 * - Visual markers show where comments exist
 * - Click marker or comment to jump to that position
 * - Resolution workflow (mark as addressed)
 *
 * This replaces the "at 2:34 the snare is too loud" emails.
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MessageSquare,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  SkipBack,
  SkipForward,
} from '@/components/ui/custom-icons';
import { useState, useRef, useEffect, useCallback } from 'react';

import { usePinnedComments, type PinnedComment } from '@/hooks/use-pinned-comments';

type WaveformCommentsProps = {
  audioUrl: string;
  audioName: string;
  entityId: string;
  entityType: 'song' | 'audio_track';
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
};

export function WaveformComments({
  audioUrl,
  audioName,
  entityId,
  entityType,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: WaveformCommentsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [loading, setLoading] = useState(true);

  // Comment state
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [pendingTimestamp, setPendingTimestamp] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [expandedComments, setExpandedComments] = useState(true);

  // Pinned comments hook
  const {
    comments,
    loading: commentsLoading,
    createComment,
    resolveComment,
    unresolveComment,
    unresolvedCount,
    resolvedCount,
  } = usePinnedComments({
    entityId,
    entityType,
    currentUserId,
    currentUserName,
    currentUserAvatar,
  });

  // Get only top-level comments (not replies)
  const topLevelComments = comments.filter((c) => !c.threadId);
  const visibleComments = showResolved
    ? topLevelComments
    : topLevelComments.filter((c) => !c.isResolved);

  // Sort by timestamp
  const sortedComments = [...visibleComments].sort((a, b) => {
    const aTime = a.location.timestamp || 0;
    const bTime = b.location.timestamp || 0;
    return aTime - bTime;
  });

  // Load and decode audio for waveform
  useEffect(() => {
    const loadAudio = async () => {
      try {
        setLoading(true);
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        const audioContext = new (
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )();
        const buffer = await audioContext.decodeAudioData(arrayBuffer);

        setAudioBuffer(buffer);
        setLoading(false);
      } catch (err) {
        console.error('Error loading audio:', err);
        setLoading(false);
      }
    };

    loadAudio();
  }, [audioUrl]);

  // Draw waveform with comment markers
  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i++) {
      const start = i * step;
      const end = Math.min(start + step, data.length);
      let min = 0;
      let max = 0;
      for (let j = start; j < end; j++) {
        const val = data[j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }

      if (i === 0) {
        ctx.moveTo(i, (1 + min) * amp);
      }
      ctx.lineTo(i, (1 + max) * amp);
      ctx.lineTo(i, (1 + min) * amp);
    }
    ctx.stroke();

    // Draw progress (played portion in accent color)
    const progress = duration > 0 ? currentTime / duration : 0;
    const progressX = progress * width;

    ctx.beginPath();
    ctx.strokeStyle = '#FF6347';
    ctx.lineWidth = 1;

    for (let i = 0; i < progressX; i++) {
      const start = i * step;
      const end = Math.min(start + step, data.length);
      let min = 0;
      let max = 0;
      for (let j = start; j < end; j++) {
        const val = data[j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }

      if (i === 0) {
        ctx.moveTo(i, (1 + min) * amp);
      }
      ctx.lineTo(i, (1 + max) * amp);
      ctx.lineTo(i, (1 + min) * amp);
    }
    ctx.stroke();

    // Draw comment markers
    const unresolvedComments = topLevelComments.filter((c) => !c.isResolved);
    unresolvedComments.forEach((comment) => {
      if (comment.location.timestamp === undefined || comment.location.timestamp === null) return;

      const markerX = (comment.location.timestamp / 1000 / duration) * width;
      if (markerX < 0 || markerX > width) return;

      // Marker line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerX, 0);
      ctx.lineTo(markerX, height);
      ctx.stroke();

      // Marker dot at top
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(markerX, 8, 6, 0, Math.PI * 2);
      ctx.fill();

      // Comment icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('●', markerX, 11);
    });

    // Draw playhead
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(progressX, 0);
    ctx.lineTo(progressX, height);
    ctx.stroke();

    // Draw pending comment marker (if adding)
    if (pendingTimestamp !== null) {
      const pendingX = (pendingTimestamp / 1000 / duration) * width;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(pendingX, 0);
      ctx.lineTo(pendingX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulsing dot
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(pendingX, 8, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [audioBuffer, currentTime, duration, topLevelComments, pendingTimestamp]);

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Click on waveform to seek OR add comment
  const handleWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const timeInSeconds = percent * duration;
    const timeInMs = Math.round(timeInSeconds * 1000);

    if (isAddingComment) {
      // Set pending timestamp for new comment
      setPendingTimestamp(timeInMs);
    } else {
      // Just seek
      audioRef.current.currentTime = timeInSeconds;
    }
  };

  // Double-click to start adding comment
  const handleWaveformDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const timeInSeconds = percent * duration;
    const timeInMs = Math.round(timeInSeconds * 1000);

    setIsAddingComment(true);
    setPendingTimestamp(timeInMs);
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newCommentText.trim() || pendingTimestamp === null) return;

    try {
      await createComment(newCommentText, { timestamp: pendingTimestamp });
      setNewCommentText('');
      setIsAddingComment(false);
      setPendingTimestamp(null);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  // Cancel adding comment
  const handleCancelComment = () => {
    setNewCommentText('');
    setIsAddingComment(false);
    setPendingTimestamp(null);
  };

  // Jump to comment timestamp
  const jumpToComment = (comment: PinnedComment) => {
    if (comment.location.timestamp === undefined || comment.location.timestamp === null) return;
    if (!audioRef.current) return;

    const timeInSeconds = comment.location.timestamp / 1000;
    audioRef.current.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (ms: number) => {
    const totalSeconds = ms / 1000;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const msRemainder = Math.round((totalSeconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${msRemainder.toString().padStart(2, '0')}`;
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + seconds)
    );
  };

  return (
    <div className="bg-panel border-border space-y-4 rounded-xl border p-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">{audioName}</h3>
          <p className="text-muted-foreground text-sm">
            {unresolvedCount} open feedback{unresolvedCount !== 1 ? 's' : ''}
            {resolvedCount > 0 && ` · ${resolvedCount} resolved`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setIsAddingComment(!isAddingComment);
              if (!isAddingComment) setPendingTimestamp(Math.round(currentTime * 1000));
            }}
            variant={isAddingComment ? 'default' : 'secondary'}
            size="sm"
          >
            {isAddingComment ? (
              <>
                <X className="mr-1 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Add Feedback
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Waveform */}
      <div
        ref={containerRef}
        className={`relative cursor-pointer overflow-hidden rounded-lg border ${
          isAddingComment ? 'border-2 border-green-500' : 'border-border'
        }`}
        style={{ height: '120px' }}
      >
        {loading ? (
          <div className="bg-surface absolute inset-0 flex items-center justify-center">
            <div className="border-brand-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={120}
            onClick={handleWaveformClick}
            onDoubleClick={handleWaveformDoubleClick}
            className="h-full w-full"
            title={
              isAddingComment
                ? 'Click to place feedback marker'
                : 'Double-click to add feedback, click to seek'
            }
          />
        )}

        {/* Time Display */}
        <div className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-1 font-mono text-xs text-white">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Adding comment mode indicator */}
        {isAddingComment && (
          <div className="absolute top-2 right-2 rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
            Click waveform to place marker
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => skip(-5)}
            className="hover:bg-surface rounded-lg p-2 transition-colors"
            title="Skip back 5s"
          >
            <SkipBack className="text-muted-foreground h-4 w-4" />
          </button>

          <button
            onClick={togglePlay}
            className="bg-brand-primary hover:bg-brand-primary/90 rounded-full p-3 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-white" />
            ) : (
              <Play className="h-5 w-5 text-white" />
            )}
          </button>

          <button
            onClick={() => skip(5)}
            className="hover:bg-surface rounded-lg p-2 transition-colors"
            title="Skip forward 5s"
          >
            <SkipForward className="text-muted-foreground h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="hover:bg-surface rounded-lg p-2 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="text-muted-foreground h-4 w-4" />
            ) : (
              <Volume2 className="text-muted-foreground h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setVolume(val);
              if (audioRef.current) audioRef.current.volume = val;
              setIsMuted(val === 0);
            }}
            className="w-20"
          />
        </div>
      </div>

      {/* Add Comment Form */}
      <AnimatePresence>
        {isAddingComment && pendingTimestamp !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4"
          >
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Clock className="h-4 w-4" />
              Feedback at {formatTimestamp(pendingTimestamp)}
            </div>

            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add your feedback... (e.g., 'Snare is too loud here', 'Love this section!')"
              className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary w-full resize-none rounded-lg border p-3 outline-hidden"
              rows={3}
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <Button onClick={handleCancelComment} variant="secondary" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newCommentText.trim()}
                variant="default"
                size="sm"
              >
                Add Feedback
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments List */}
      <div className="border-border border-t pt-4">
        <button
          onClick={() => setExpandedComments(!expandedComments)}
          className="hover:bg-surface flex w-full items-center justify-between rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="text-brand-primary h-4 w-4" />
            <span className="text-foreground font-medium">Feedback ({sortedComments.length})</span>
          </div>
          {expandedComments ? (
            <ChevronUp className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          )}
        </button>

        <AnimatePresence>
          {expandedComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2"
            >
              {/* Filter toggle */}
              <div className="mb-3 flex items-center gap-2">
                <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showResolved}
                    onChange={(e) => setShowResolved(e.target.checked)}
                    className="border-border rounded"
                  />
                  Show resolved
                </label>
              </div>

              {sortedComments.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-muted-foreground text-sm">No feedback yet</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Double-click on the waveform to add feedback
                  </p>
                </div>
              ) : (
                sortedComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      comment.isResolved
                        ? 'border-border bg-surface/50 opacity-60'
                        : 'border-border bg-surface hover:border-brand-primary/30'
                    }`}
                  >
                    {/* Timestamp button */}
                    <button
                      onClick={() => jumpToComment(comment)}
                      className="shrink-0 rounded bg-blue-500/10 px-2 py-1 font-mono text-xs text-blue-400 transition-colors hover:bg-blue-500/20"
                      title="Jump to this timestamp"
                    >
                      {formatTimestamp(comment.location.timestamp || 0)}
                    </button>

                    {/* Comment content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-medium">
                          {comment.userName}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {comment.isResolved && (
                          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                            <Check className="h-3 w-3" />
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-foreground mt-1 text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>

                    {/* Resolve button */}
                    <button
                      onClick={() =>
                        comment.isResolved
                          ? unresolveComment(comment.id)
                          : resolveComment(comment.id)
                      }
                      className={`shrink-0 rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100 ${
                        comment.isResolved
                          ? 'text-muted-foreground hover:bg-surface hover:text-foreground'
                          : 'text-green-400 hover:bg-green-500/10'
                      }`}
                      title={comment.isResolved ? 'Unresolve' : 'Mark as resolved'}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
