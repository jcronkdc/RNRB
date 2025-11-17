'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Reply, Edit, Trash2, Send } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@cronkwaters/ui'
import { Button } from '@cronkwaters/ui'
import { Textarea } from '@cronkwaters/ui'
import { createComment, updateComment, deleteComment } from '@/lib/actions/comments'
import { cn } from '@cronkwaters/ui'
import type { Comment } from '@prisma/client'

interface CommentWithUser extends Comment {
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: CommentWithUser[]
}

interface CommentListProps {
  comments: CommentWithUser[]
  entityType: 'project' | 'song'
  entityId: string
  currentUserId?: string
}

export function CommentList({
  comments,
  entityType,
  entityId,
  currentUserId
}: CommentListProps) {
  return (
    <div className="space-y-4">
      <CommentForm
        entityType={entityType}
        entityId={entityId}
      />
      
      {comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              entityType={entityType}
              entityId={entityId}
              currentUserId={currentUserId}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentFormProps {
  entityType: 'project' | 'song'
  entityId: string
  parentId?: string
  onCancel?: () => void
  onSuccess?: () => void
}

function CommentForm({
  entityType,
  entityId,
  parentId,
  onCancel,
  onSuccess
}: CommentFormProps) {
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await createComment(entityType, entityId, text.trim(), parentId)
      setText('')
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Write a comment..."}
        className="min-h-[80px]"
        disabled={isSubmitting}
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={!text.trim() || isSubmitting}
        >
          <Send className="h-4 w-4 mr-1" />
          {parentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </form>
  )
}

interface CommentItemProps {
  comment: CommentWithUser
  entityType: 'project' | 'song'
  entityId: string
  currentUserId?: string
  level: number
}

function CommentItem({
  comment,
  entityType,
  entityId,
  currentUserId,
  level
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAuthor = currentUserId === comment.user.id
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleEdit = async () => {
    if (!editText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await updateComment(comment.id, editText.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setIsSubmitting(true)
    try {
      await deleteComment(comment.id)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        "group",
        level > 0 && "ml-12 border-l-2 border-muted pl-4"
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.image || ''} />
          <AvatarFallback>
            {comment.user.name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.user.name || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.editedAt && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px]"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setEditText(comment.text)
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editText.trim() || isSubmitting}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              
              {isAuthor && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}

          {isReplying && (
            <div className="mt-3">
              <CommentForm
                entityType={entityType}
                entityId={entityId}
                parentId={comment.id}
                onCancel={() => setIsReplying(false)}
                onSuccess={() => setIsReplying(false)}
              />
            </div>
          )}

          {hasReplies && (
            <div className="mt-4 space-y-4">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  entityType={entityType}
                  entityId={entityId}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
