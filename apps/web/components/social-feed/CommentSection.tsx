'use client';

import { format } from 'date-fns';
import { Send, Loader2, Heart } from '@/components/ui/custom-icons';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/feed/comments?postId=${postId}`);
      if (!response.ok) throw new Error('Failed to load comments');

      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Post comment
  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const response = await fetch('/api/feed/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: newComment,
          parentId: replyingTo,
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const data = await response.json();

      if (replyingTo) {
        // Add reply to parent comment
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo
              ? {
                  ...c,
                  replyCount: c.replyCount + 1,
                  replies: [...(c.replies || []), data.comment],
                }
              : c
          )
        );
      } else {
        // Add new top-level comment
        setComments((prev) => [data.comment, ...prev]);
      }

      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  // React to comment
  const handleCommentReaction = async (commentId: string, emoji: string) => {
    try {
      const response = await fetch('/api/feed/comment-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, emoji }),
      });

      if (response.ok) {
        loadComments(); // Reload to get updated reactions
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
    }
  };

  if (!session?.user) {
    return <div className="text-center text-white/60">Sign in to comment</div>;
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-purple-500 to-pink-500">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'You'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
              {(session.user.name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          {replyingTo && (
            <div className="mb-2 text-sm text-purple-400">
              Replying to comment...{' '}
              <button onClick={() => setReplyingTo(null)} className="underline">
                Cancel
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-hidden"
            />
            <button
              onClick={handleSubmit}
              disabled={posting || !newComment.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-pink-500 text-white transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-white/40">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={() => setReplyingTo(comment.id)}
              onReact={(emoji) => handleCommentReaction(comment.id, emoji)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Individual Comment Component
function Comment({
  comment,
  onReply,
  onReact,
  isReply = false,
}: {
  comment: any;
  onReply: () => void;
  onReact: (emoji: string) => void;
  isReply?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-12' : ''}`}>
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-purple-500 to-pink-500">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={comment.user.name || 'User'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
            {(comment.user.name || 'U')[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1">
        {/* Comment Header */}
        <div className="mb-1 flex items-center gap-2">
          <span className="font-semibold text-white">{comment.user.name || 'Anonymous'}</span>
          <span className="text-xs text-white/40">
            {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
          </span>
          {comment.editedAt && <span className="text-xs text-white/40">(edited)</span>}
        </div>

        {/* Comment Content */}
        <p className="mb-2 text-sm text-white/90">{comment.content}</p>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => onReact('❤️')}
            className="flex items-center gap-1 text-white/60 transition-colors hover:text-purple-400"
          >
            <Heart className="h-3 w-3" />
            {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
          </button>

          <button onClick={onReply} className="text-white/60 transition-colors hover:text-white">
            Reply
          </button>

          {comment._count?.replies > 0 && !showReplies && (
            <button onClick={() => setShowReplies(true)} className="text-purple-400">
              View {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Replies */}
        {showReplies && comment.replies && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply: any) => (
              <Comment key={reply.id} comment={reply} onReply={onReply} onReact={onReact} isReply />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
