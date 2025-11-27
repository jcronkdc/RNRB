/**
 * Pinned Comments Hook
 *
 * Figma-style comments pinned to specific content
 * Perfect for giving feedback on specific lyrics/sections
 *
 * Features:
 * - Pin comment to line number, timestamp, or text selection
 * - Thread replies
 * - Resolve/unresolve
 * - @mentions
 * - Reactions
 */

import { useState, useCallback, useEffect } from 'react';

export type PinnedCommentLocation = {
  lineNumber?: number; // For lyrics
  timestamp?: number; // For audio (milliseconds)
  selection?: { start: number; end: number; text?: string }; // For text selection
};

export type PinnedComment = {
  id: string;
  entityId: string; // Song ID, project ID, etc
  entityType: 'song' | 'project' | 'lyric_line' | 'audio_track';
  location: PinnedCommentLocation;

  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;

  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;

  threadId?: string; // If this is a reply
  reactions?: Record<string, string[]>; // { "👍": ["userId1"], "❤️": ["userId2"] }

  createdAt: Date;
  updatedAt: Date;
};

interface UsePinnedCommentsOptions {
  entityId: string;
  entityType: 'song' | 'project' | 'lyric_line' | 'audio_track';
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
}

export function usePinnedComments({
  entityId,
  entityType,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: UsePinnedCommentsOptions) {
  const [comments, setComments] = useState<PinnedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/comments/pinned?entityId=${entityId}&entityType=${entityType}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching pinned comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  // Load comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Create new comment
  const createComment = useCallback(
    async (content: string, location: PinnedCommentLocation, threadId?: string) => {
      try {
        const response = await fetch('/api/comments/pinned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entityId,
            entityType,
            content,
            location,
            threadId,
            userId: currentUserId,
            userName: currentUserName,
            userAvatar: currentUserAvatar,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create comment');
        }

        const data = await response.json();
        const newComment: PinnedComment = data.comment;

        setComments((prev) => [...prev, newComment]);

        return newComment;
      } catch (err) {
        console.error('Error creating comment:', err);
        throw err;
      }
    },
    [entityId, entityType, currentUserId, currentUserName, currentUserAvatar]
  );

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/comments/pinned/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const data = await response.json();
      const updatedComment: PinnedComment = data.comment;

      setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)));

      return updatedComment;
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, []);

  // Delete comment
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/pinned/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, []);

  // Resolve comment
  const resolveComment = useCallback(
    async (commentId: string) => {
      try {
        const response = await fetch(`/api/comments/pinned/${commentId}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resolved: true,
            resolvedBy: currentUserId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to resolve comment');
        }

        const data = await response.json();
        const resolvedComment: PinnedComment = data.comment;

        setComments((prev) => prev.map((c) => (c.id === commentId ? resolvedComment : c)));

        return resolvedComment;
      } catch (err) {
        console.error('Error resolving comment:', err);
        throw err;
      }
    },
    [currentUserId]
  );

  // Unresolve comment
  const unresolveComment = useCallback(async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/pinned/${commentId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unresolve comment');
      }

      const data = await response.json();
      const unresolvedComment: PinnedComment = data.comment;

      setComments((prev) => prev.map((c) => (c.id === commentId ? unresolvedComment : c)));

      return unresolvedComment;
    } catch (err) {
      console.error('Error unresolving comment:', err);
      throw err;
    }
  }, []);

  // Add reaction
  const addReaction = useCallback(
    async (commentId: string, emoji: string) => {
      try {
        const response = await fetch(`/api/comments/pinned/${commentId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emoji,
            userId: currentUserId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add reaction');
        }

        const data = await response.json();
        const updatedComment: PinnedComment = data.comment;

        setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)));

        return updatedComment;
      } catch (err) {
        console.error('Error adding reaction:', err);
        throw err;
      }
    },
    [currentUserId]
  );

  // Remove reaction
  const removeReaction = useCallback(
    async (commentId: string, emoji: string) => {
      try {
        const response = await fetch(`/api/comments/pinned/${commentId}/react`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emoji,
            userId: currentUserId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove reaction');
        }

        const data = await response.json();
        const updatedComment: PinnedComment = data.comment;

        setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)));

        return updatedComment;
      } catch (err) {
        console.error('Error removing reaction:', err);
        throw err;
      }
    },
    [currentUserId]
  );

  // Get comments by location
  const getCommentsAtLine = useCallback(
    (lineNumber: number) => {
      return comments.filter(
        (c) => c.location.lineNumber === lineNumber && !c.threadId && !c.isResolved
      );
    },
    [comments]
  );

  const getCommentsAtTimestamp = useCallback(
    (timestamp: number, range = 1000) => {
      return comments.filter(
        (c) =>
          c.location.timestamp !== undefined &&
          Math.abs(c.location.timestamp - timestamp) <= range &&
          !c.threadId &&
          !c.isResolved
      );
    },
    [comments]
  );

  // Get thread for a comment
  const getThread = useCallback(
    (commentId: string) => {
      return comments.filter((c) => c.threadId === commentId);
    },
    [comments]
  );

  // Statistics
  const unresolvedCount = comments.filter((c) => !c.isResolved && !c.threadId).length;
  const resolvedCount = comments.filter((c) => c.isResolved && !c.threadId).length;
  const totalCount = comments.filter((c) => !c.threadId).length;

  return {
    comments,
    loading,
    error,

    // Actions
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
    addReaction,
    removeReaction,

    // Queries
    getCommentsAtLine,
    getCommentsAtTimestamp,
    getThread,

    // Stats
    unresolvedCount,
    resolvedCount,
    totalCount,

    // Refresh
    refetch: fetchComments,
  };
}






