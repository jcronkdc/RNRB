'use client';

import { Button, cn } from '@songforge/ui';
import { Send, MessageSquare, User } from 'lucide-react';
import { useState, useRef } from 'react';

import { EmptyState } from './EmptyState';

interface Comment {
  id: string;
  text: string;
  author: string;
  authorAvatar?: string;
  timestamp: Date;
}

interface CommentsProps {
  entityId: string;
  entityType: 'project' | 'song' | 'asset' | 'split' | 'license';
  comments?: Comment[];
  onCreate?: (text: string) => void | Promise<void>;
  className?: string;
}

export function Comments({ entityId: _entityId, entityType: _entityType, comments: initialComments = [], onCreate, className }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !onCreate) return;

    setIsSubmitting(true);
    try {
      await onCreate(text.trim());
      setComments((prev) => [
        ...prev,
        {
          id: `comment-${Date.now()}`,
          text: text.trim(),
          author: 'You',
          timestamp: new Date()
        }
      ]);
      setText('');
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-brand-primary" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-brand-foreground">Comments</h3>
        {comments.length > 0 && (
          <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
            {comments.length}
          </span>
        )}
      </div>

      {comments.length === 0 && !onCreate ? (
        <EmptyState
          icon={MessageSquare}
          title="No Comments Yet"
          description="Start the conversation. Comments help keep collaborators aligned and track decisions."
        />
      ) : (
        <>
          {comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    {comment.authorAvatar ? (
                      <img src={comment.authorAvatar} alt={comment.author} className="h-full w-full rounded-full" />
                    ) : (
                      <User className="h-4 w-4" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-brand-foreground">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {onCreate && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="w-full rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-brand-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:ring-2 focus-visible:ring-brand-primary"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!text.trim() || isSubmitting}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Post Comment
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

