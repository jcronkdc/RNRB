/**
 * Collaboration Sync Hook
 *
 * The mycelial connective tissue - makes all systems communicate
 *
 * When one thing happens, the network responds:
 * - Audio upload → Activity feed + Notification + Presence update
 * - Video start → Activity feed + Notification + Presence update
 * - User joins → Activity feed + Notification
 * - Chat message → Activity feed (if @mention → Notification)
 * - Song created → Activity feed + Notification to collaborators
 *
 * This creates the living, breathing network effect!
 */

import { useActivityFeed, type ActivityEvent } from './use-activity-feed';
import { useNotifications } from './use-notifications';

type CollaborationMetadata = {
  collaboratorIds?: string[];
  mentionedUserId?: string;
  inviteeEmail?: string;
  link?: string;
  [key: string]: unknown;
};

type CollaborationEvent = {
  type:
    | 'audio_upload'
    | 'video_start'
    | 'user_join'
    | 'chat_mention'
    | 'song_create'
    | 'invite_sent';
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId?: string;
  projectName?: string;
  songId?: string;
  songName?: string;
  message?: string;
  metadata?: CollaborationMetadata;
};

type UseCollaborationSyncOptions = {
  projectId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
};

export function useCollaborationSync({
  projectId,
  userId,
  userName,
  userEmail,
  userAvatar,
}: UseCollaborationSyncOptions) {
  // Get activity feed publisher
  const { publishActivity } = useActivityFeed({
    channelName: projectId ? `activity:project:${projectId}` : 'activity:global',
  });

  // Get notification sender
  const { sendNotification } = useNotifications({ userId });

  /**
   * Broadcast a collaboration event to all systems
   * This is the key function that makes the network alive!
   */
  const broadcastEvent = async (event: CollaborationEvent) => {
    const timestamp = Date.now();

    // Map collaboration event types to activity types
    const activityTypeMap: Record<CollaborationEvent['type'], ActivityEvent['type']> = {
      audio_upload: 'audio_uploaded',
      video_start: 'video_started',
      user_join: 'user_joined',
      chat_mention: 'chat_message',
      song_create: 'song_created',
      invite_sent: 'invite_sent',
    };

    // 1. Publish to Activity Feed (visible to all)
    await publishActivity({
      type: activityTypeMap[event.type],
      userId: event.userId,
      userName: event.userName,
      userAvatar: event.userAvatar,
      projectId: event.projectId,
      projectName: event.projectName,
      songId: event.songId,
      songName: event.songName,
      message: event.message,
      metadata: event.metadata,
    });

    // 2. Send Notifications (to relevant users)
    if (event.type === 'audio_upload' && event.metadata?.collaboratorIds) {
      // Notify all collaborators about audio upload
      for (const collabId of event.metadata.collaboratorIds) {
        if (collabId !== userId) {
          // Don't notify yourself
          await sendNotification(collabId, {
            type: 'upload',
            title: 'New Audio Upload',
            message: `${event.userName} uploaded audio to "${event.songName}"`,
            fromUserId: event.userId,
            fromUserName: event.userName,
            fromUserAvatar: event.userAvatar,
            link: `/projects/${event.projectId}/songs/${event.songId}`,
            metadata: event.metadata,
          });
        }
      }
    }

    if (event.type === 'video_start' && event.metadata?.collaboratorIds) {
      // Notify all collaborators that video session started
      for (const collabId of event.metadata.collaboratorIds) {
        if (collabId !== userId) {
          await sendNotification(collabId, {
            type: 'video_start',
            title: 'Video Session Started',
            message: `${event.userName} started a video session in ${event.projectName}`,
            fromUserId: event.userId,
            fromUserName: event.userName,
            fromUserAvatar: event.userAvatar,
            link: `/projects/${event.projectId}/collaborate`,
            metadata: event.metadata,
          });
        }
      }
    }

    if (event.type === 'user_join' && event.metadata?.collaboratorIds) {
      // Notify existing collaborators about new member
      for (const collabId of event.metadata.collaboratorIds) {
        if (collabId !== userId) {
          await sendNotification(collabId, {
            type: 'collab_request',
            title: 'New Team Member',
            message: `${event.userName} joined ${event.projectName}`,
            fromUserId: event.userId,
            fromUserName: event.userName,
            fromUserAvatar: event.userAvatar,
            link: `/projects/${event.projectId}/collaborate`,
            metadata: event.metadata,
          });
        }
      }
    }

    if (event.type === 'chat_mention' && event.metadata?.mentionedUserId) {
      // Notify user they were mentioned
      await sendNotification(event.metadata.mentionedUserId, {
        type: 'mention',
        title: 'You were mentioned',
        message: `${event.userName}: ${event.message}`,
        fromUserId: event.userId,
        fromUserName: event.userName,
        fromUserAvatar: event.userAvatar,
        link: event.metadata.link,
        metadata: event.metadata,
      });
    }

    if (event.type === 'song_create' && event.metadata?.collaboratorIds) {
      // Notify all collaborators about new song
      for (const collabId of event.metadata.collaboratorIds) {
        if (collabId !== userId) {
          await sendNotification(collabId, {
            type: 'comment',
            title: 'New Song Created',
            message: `${event.userName} created "${event.songName}" in ${event.projectName}`,
            fromUserId: event.userId,
            fromUserName: event.userName,
            fromUserAvatar: event.userAvatar,
            link: `/projects/${event.projectId}/songs/${event.songId}`,
            metadata: event.metadata,
          });
        }
      }
    }

    if (event.type === 'invite_sent' && event.metadata?.inviteeEmail) {
      // Notify invited user (when they sign up and check notifications)
      // This would be handled by the invite acceptance flow
      console.log('Invite sent to:', event.metadata.inviteeEmail);
    }

    // 3. Update Global Activity Feed (if not project-specific)
    if (!projectId) {
      // Also publish to global feed
      const { publishActivity: publishGlobal } = useActivityFeed({
        channelName: 'activity:global',
      });

      await publishGlobal({
        type: activityTypeMap[event.type],
        userId: event.userId,
        userName: event.userName,
        userAvatar: event.userAvatar,
        projectId: event.projectId,
        projectName: event.projectName,
        songId: event.songId,
        songName: event.songName,
        message: event.message,
        metadata: event.metadata,
      });
    }
  };

  return {
    broadcastEvent,
  };
}

/**
 * Helper hooks for common collaboration events
 */

export function useAudioUploadSync(options: UseCollaborationSyncOptions) {
  const { broadcastEvent } = useCollaborationSync(options);

  const syncAudioUpload = async (songId: string, songName: string, collaboratorIds: string[]) => {
    await broadcastEvent({
      type: 'audio_upload',
      userId: options.userId,
      userName: options.userName,
      userAvatar: options.userAvatar,
      projectId: options.projectId,
      projectName: '', // Would be passed in
      songId,
      songName,
      metadata: { collaboratorIds },
    });
  };

  return { syncAudioUpload };
}

export function useVideoStartSync(options: UseCollaborationSyncOptions) {
  const { broadcastEvent } = useCollaborationSync(options);

  const syncVideoStart = async (roomName: string, collaboratorIds: string[]) => {
    await broadcastEvent({
      type: 'video_start',
      userId: options.userId,
      userName: options.userName,
      userAvatar: options.userAvatar,
      projectId: options.projectId,
      projectName: '', // Would be passed in
      metadata: { roomName, collaboratorIds },
    });
  };

  return { syncVideoStart };
}

export function useChatMentionSync(options: UseCollaborationSyncOptions) {
  const { broadcastEvent } = useCollaborationSync(options);

  const syncChatMention = async (mentionedUserId: string, message: string, link: string) => {
    await broadcastEvent({
      type: 'chat_mention',
      userId: options.userId,
      userName: options.userName,
      userAvatar: options.userAvatar,
      projectId: options.projectId,
      message,
      metadata: { mentionedUserId, link },
    });
  };

  return { syncChatMention };
}

export function useSongCreateSync(options: UseCollaborationSyncOptions) {
  const { broadcastEvent } = useCollaborationSync(options);

  const syncSongCreate = async (songId: string, songName: string, collaboratorIds: string[]) => {
    await broadcastEvent({
      type: 'song_create',
      userId: options.userId,
      userName: options.userName,
      userAvatar: options.userAvatar,
      projectId: options.projectId,
      projectName: '', // Would be passed in
      songId,
      songName,
      metadata: { collaboratorIds },
    });
  };

  return { syncSongCreate };
}

export function useUserJoinSync(options: UseCollaborationSyncOptions) {
  const { broadcastEvent } = useCollaborationSync(options);

  const syncUserJoin = async (projectName: string, collaboratorIds: string[]) => {
    await broadcastEvent({
      type: 'user_join',
      userId: options.userId,
      userName: options.userName,
      userAvatar: options.userAvatar,
      projectId: options.projectId,
      projectName,
      metadata: { collaboratorIds },
    });
  };

  return { syncUserJoin };
}
