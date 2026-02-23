'use client';

import { motion } from 'motion/react';
import { MessageSquare, Reply, Loader2, Send, User } from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

import { formatRelativeTime } from '@/lib/format-date';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies?: Comment[];
}

interface CommentThreadProps {
  trackId: string;
  currentUserId?: string;
}

export function CommentThread({ trackId, currentUserId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [trackId]);

  async function fetchComments() {
    try {
      const response = await fetch(`/api/community/tracks/${trackId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function postComment(content: string, parentId: string | null = null) {
    if (!content.trim() || !currentUserId) return;

    setPosting(true);
    try {
      const response = await fetch(`/api/community/tracks/${trackId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });

      if (response.ok) {
        await fetchComments();
        setNewComment('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setPosting(false);
    }
  }

  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800">
          {comment.user.image ? (
            <img
              src={comment.user.image}
              alt={comment.user.name || 'User'}
              className="h-full w-full rounded-full"
            />
          ) : (
            <User className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{comment.user.name || 'Unknown'}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-gray-300">{comment.content}</p>

          {/* Reply Button */}
          {currentUserId && depth < 2 && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 transition hover:text-orange-500"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="flex-1 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      postComment(e.currentTarget.value, comment.id);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies &&
            comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <MessageSquare className="h-5 w-5 text-orange-500" />
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      {currentUserId ? (
        <div className="mb-6 flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => postComment(newComment)}
                disabled={posting || !newComment.trim()}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {posting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-gray-800 bg-black p-4 text-center text-sm text-gray-400">
          Sign in to comment
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">No comments yet. Be the first!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
