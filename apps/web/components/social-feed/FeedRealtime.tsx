'use client';

import { useEffect } from 'react';
import { useAblyClient } from '@/hooks/use-ably-client';
import { useSession } from 'next-auth/react';
import type { Types } from 'ably';

interface FeedRealtimeProps {
  onNewPost: (post: any) => void;
  onPostUpdated: (post: any) => void;
  onPostDeleted: (postId: string) => void;
  onReactionAdded: (data: { postId: string; reaction: any; likeCount: number }) => void;
  onCommentAdded: (data: { postId: string; comment: any; commentCount: number }) => void;
}

export function FeedRealtime({
  onNewPost,
  onPostUpdated,
  onPostDeleted,
  onReactionAdded,
  onCommentAdded,
}: FeedRealtimeProps) {
  const { data: session } = useSession();
  const { client, isConnected } = useAblyClient(session?.user?.id);

  useEffect(() => {
    if (!client || !isConnected || !session?.user?.id) return;

    // Subscribe to global feed channel
    const feedChannel = client.channels.get('feed:public');

    // New post published
    feedChannel.subscribe('post:created', (message: Types.Message) => {
      onNewPost(message.data);
    });

    // Post updated
    feedChannel.subscribe('post:updated', (message: Types.Message) => {
      onPostUpdated(message.data);
    });

    // Post deleted
    feedChannel.subscribe('post:deleted', (message: Types.Message) => {
      onPostDeleted(message.data.postId);
    });

    // Reaction added
    feedChannel.subscribe('reaction:added', (message: Types.Message) => {
      onReactionAdded(message.data);
    });

    // Comment added
    feedChannel.subscribe('comment:added', (message: Types.Message) => {
      onCommentAdded(message.data);
    });

    // Subscribe to user's following feed
    const followingChannel = client.channels.get(`feed:user:${session.user.id}:following`);

    followingChannel.subscribe('post:created', (message: Types.Message) => {
      // Only add if following the author
      onNewPost(message.data);
    });

    // Cleanup
    return () => {
      feedChannel.unsubscribe();
      followingChannel.unsubscribe();
    };
  }, [
    client,
    isConnected,
    session?.user?.id,
    onNewPost,
    onPostUpdated,
    onPostDeleted,
    onReactionAdded,
    onCommentAdded,
  ]);

  return null; // This is a headless component
}
