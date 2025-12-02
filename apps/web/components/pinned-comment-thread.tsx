'use client';

/**
 * Pinned Comment Thread Component
 *
 * Figma-style comment threads on specific content
 * Perfect for giving feedback on specific lyrics/sections
 *
 * Features:
 * - Click to add comment at location
 * - Thread replies
 * - Resolve/unresolve
 * - Emoji reactions
 * - @mentions
 * - Hover preview
 */

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Check,
  X,
  MoreVertical,
  Reply,
  Trash2,
  Edit2,
  Smile,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

import type { PinnedComment } from '@/hooks/use-pinned-comments';
import { usePinnedComments } from '@/hooks/use-pinned-comments';

interface PinnedCommentThreadProps {
  entityId: string;
  entityType: 'song' | 'project' | 'lyric_line' | 'audio_track';
  lineNumber?: number;
  timestamp?: number;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  className?: string;
}

export function PinnedCommentThread({
  entityId,
  entityType,
  lineNumber,
  timestamp,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  className = '',
}: PinnedCommentThreadProps) {
  const {
    comments,
    loading,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
    addReaction,
    getCommentsAtLine,
    getCommentsAtTimestamp,
    getThread,
  } = usePinnedComments({
    entityId,
    entityType,
    currentUserId,
    currentUserName,
    currentUserAvatar,
  });

  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Get relevant comments for this location
  const relevantComments = lineNumber
    ? getCommentsAtLine(lineNumber)
    : timestamp
      ? getCommentsAtTimestamp(timestamp)
      : comments.filter((c) => !c.threadId);

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      const location = lineNumber ? { lineNumber } : timestamp ? { timestamp } : {};

      await createComment(newCommentText, location, replyingTo || undefined);

      setNewCommentText('');
      setIsAddingComment(false);
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await updateComment(commentId, editText);
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const handleResolve = async (commentId: string, resolved: boolean) => {
    try {
      if (resolved) {
        await resolveComment(commentId);
      } else {
        await unresolveComment(commentId);
      }
    } catch (error) {
      console.error('Failed to resolve/unresolve comment:', error);
    }
  };

  const handleReaction = async (commentId: string, emoji: string, hasReacted: boolean) => {
    try {
      if (hasReacted) {
        await addReaction(commentId, emoji);
      } else {
        // Would need removeReaction implementation
        console.log('Remove reaction:', emoji);
      }
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setIsAddingComment(true);
  };

  const startEdit = (comment: PinnedComment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  if (loading) {
    return (
      <div className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
        <p className="text-sm text-muted-foreground">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border bg-surface ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-brand-primary" />
          <h3 className="font-semibold text-foreground">
            Comments {relevantComments.length > 0 && `(${relevantComments.length})`}
          </h3>
        </div>
        <Button onClick={() => setIsAddingComment(!isAddingComment)} variant="default" size="sm">
          Add Comment
        </Button>
      </div>

      {/* Comments List */}
      <div className="max-h-[600px] space-y-4 overflow-y-auto p-4">
        <AnimatePresence>
          {relevantComments.map((comment) => {
            const thread = getThread(comment.id);
            const reactions = (comment.reactions as Record<string, string[]>) || {};
            const isOwner = comment.userId === currentUserId;

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-lg border border-border p-4 ${
                  comment.isResolved ? 'bg-surface-muted opacity-60' : 'bg-surface'
                }`}
              >
                {/* Comment Header */}
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-semibold text-foreground">
                      {comment.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        comment.userName[0].toUpperCase()
                      )}
                    </div>

                    {/* Name and time */}
                    <div>
                      <p className="text-sm font-medium text-foreground">{comment.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {comment.isResolved && (
                      <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1">
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Resolved</span>
                      </div>
                    )}
                    {isOwner && (
                      <Button variant="secondary" size="sm">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Comment Content */}
                {editingId === comment.id ? (
                  <div className="mb-3 space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full rounded border border-border bg-surface p-2 text-sm text-foreground"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditComment(comment.id)}
                        size="sm"
                        variant="default"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setEditText('');
                        }}
                        size="sm"
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mb-3 whitespace-pre-wrap text-sm text-foreground">
                    {comment.content}
                  </p>
                )}

                {/* Reactions */}
                {Object.keys(reactions).length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {Object.entries(reactions).map(([emoji, userIds]) => {
                      const hasReacted = userIds.includes(currentUserId);

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(comment.id, emoji, !hasReacted)}
                          className={`flex items-center gap-1 rounded-full border px-2 py-1 text-sm transition ${
                            hasReacted
                              ? 'border-brand-primary bg-brand-primary/10'
                              : 'border-border hover:bg-surface-muted'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-xs">{userIds.length}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button onClick={() => startReply(comment.id)} size="sm" variant="secondary">
                    <Reply className="h-3 w-3" />
                    <span>Reply</span>
                  </Button>

                  <Button
                    onClick={() => handleResolve(comment.id, !comment.isResolved)}
                    size="sm"
                    variant="secondary"
                  >
                    {comment.isResolved ? (
                      <>
                        <X className="h-3 w-3" />
                        <span>Unresolve</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Resolve</span>
                      </>
                    )}
                  </Button>

                  {isOwner && (
                    <>
                      <Button onClick={() => startEdit(comment)} size="sm" variant="secondary">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteComment(comment.id)}
                        size="sm"
                        variant="secondary"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}

                  <Button size="sm" variant="secondary">
                    <Smile className="h-3 w-3" />
                  </Button>
                </div>

                {/* Thread Replies */}
                {thread.length > 0 && (
                  <div className="ml-10 mt-4 space-y-3 border-l-2 border-brand-primary/30 pl-4">
                    {thread.map((reply) => (
                      <div key={reply.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-semibold text-foreground">
                            {reply.userAvatar ? (
                              <img
                                src={reply.userAvatar}
                                alt={reply.userName}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              reply.userName[0].toUpperCase()
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {reply.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* No comments state */}
        {relevantComments.length === 0 && !isAddingComment && (
          <div className="py-8 text-center">
            <MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">No comments yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a comment to start the conversation
            </p>
          </div>
        )}

        {/* Add Comment Form */}
        {isAddingComment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            {replyingTo && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Replying to comment...</p>
                <Button onClick={() => setReplyingTo(null)} size="sm" variant="secondary">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment... Use @ to mention someone"
              className="w-full resize-none rounded-lg border border-border bg-surface p-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              rows={3}
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsAddingComment(false);
                  setNewCommentText('');
                  setReplyingTo(null);
                }}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                variant="default"
                size="sm"
              >
                {replyingTo ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
