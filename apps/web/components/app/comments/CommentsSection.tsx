import { MessageSquare } from 'lucide-react'
import { getComments } from '@/lib/actions/comments'
import { currentUser } from '@/lib/session'
import { CommentList } from './CommentList'

interface CommentsSectionProps {
  entityType: 'project' | 'song'
  entityId: string
}

export async function CommentsSection({
  entityType,
  entityId
}: CommentsSectionProps) {
  const [comments, user] = await Promise.all([
    getComments(entityType, entityId),
    currentUser()
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Comments</h3>
        <span className="text-sm text-muted-foreground">
          ({comments.length})
        </span>
      </div>
      
      <CommentList
        comments={comments}
        entityType={entityType}
        entityId={entityId}
        currentUserId={user?.id}
      />
    </div>
  )
}
