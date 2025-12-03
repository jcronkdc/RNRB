/**
 * Setlist Voting Hook
 *
 * Band members vote on song order in real-time.
 * Democratic setlist building!
 *
 * Features:
 * - Upvote/downvote songs
 * - Live vote counts
 * - User voting status
 * - Auto-sort by vote count
 * - Vote locking for finalization
 */

import type { Message } from 'ably';
import { useChannel, useConnectionStateListener } from 'ably/react';
import { useCallback, useEffect, useState } from 'react';

export type SetlistSong = {
  id: string;
  title: string;
  duration?: number; // In seconds
  key?: string;
  tempo?: number;
};

export type SongVote = {
  songId: string;
  votes: {
    up: string[]; // User IDs who upvoted
    down: string[]; // User IDs who downvoted
  };
  score: number; // up.length - down.length
};

export type VoteAction = {
  userId: string;
  userName: string;
  songId: string;
  voteType: 'up' | 'down' | 'clear';
  timestamp: number;
};

export type VotingUser = {
  userId: string;
  userName: string;
  hasVoted: boolean;
  votedSongs: string[];
  lastUpdate: number;
};

type UseSetlistVotingOptions = {
  channelName: string;
  userId: string;
  userName: string;
  songs: SetlistSong[];
  enabled?: boolean;
};

export function useSetlistVoting({
  channelName,
  userId,
  userName,
  songs,
  enabled = true,
}: UseSetlistVotingOptions) {
  const [votes, setVotes] = useState<Map<string, SongVote>>(new Map());
  const [votingUsers, setVotingUsers] = useState<Map<string, VotingUser>>(new Map());
  const [isLocked, setIsLocked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize votes for all songs
  useEffect(() => {
    setVotes((prev) => {
      const newMap = new Map(prev);
      for (const song of songs) {
        if (!newMap.has(song.id)) {
          newMap.set(song.id, {
            songId: song.id,
            votes: { up: [], down: [] },
            score: 0,
          });
        }
      }
      return newMap;
    });
  }, [songs]);

  // Monitor connection state
  useConnectionStateListener((stateChange) => {
    setIsConnected(stateChange.current === 'connected');
    if (stateChange.current === 'failed') {
      setError('Connection failed');
    } else if (stateChange.current === 'connected') {
      setError(null);
    }
  });

  // Channel for vote actions
  const { publish: publishVote } = useChannel(channelName, 'vote-action', (message: Message) => {
    if (!enabled) return;
    const action = message.data as VoteAction;

    setVotes((prev) => {
      const newMap = new Map(prev);
      const songVote = newMap.get(action.songId) || {
        songId: action.songId,
        votes: { up: [], down: [] },
        score: 0,
      };

      // Remove any existing vote from this user
      songVote.votes.up = songVote.votes.up.filter((id) => id !== action.userId);
      songVote.votes.down = songVote.votes.down.filter((id) => id !== action.userId);

      // Add new vote
      if (action.voteType === 'up') {
        songVote.votes.up.push(action.userId);
      } else if (action.voteType === 'down') {
        songVote.votes.down.push(action.userId);
      }

      // Calculate score
      songVote.score = songVote.votes.up.length - songVote.votes.down.length;

      newMap.set(action.songId, songVote);
      return newMap;
    });
  });

  // Channel for voting presence
  const { publish: publishPresence } = useChannel(
    channelName,
    'voting-presence',
    (message: Message) => {
      if (!enabled) return;
      const user = message.data as VotingUser;

      setVotingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(user.userId, user);
        return newMap;
      });
    }
  );

  // Channel for lock state
  const { publish: publishLock } = useChannel(channelName, 'voting-lock', (message: Message) => {
    if (!enabled) return;
    const { locked } = message.data as { locked: boolean };
    setIsLocked(locked);
  });

  // Cast a vote
  const vote = useCallback(
    (songId: string, voteType: 'up' | 'down' | 'clear') => {
      if (!publishVote || !enabled || isLocked) return;

      const action: VoteAction = {
        userId,
        userName,
        songId,
        voteType,
        timestamp: Date.now(),
      };

      // Update local state immediately
      setVotes((prev) => {
        const newMap = new Map(prev);
        const songVote = newMap.get(songId) || {
          songId,
          votes: { up: [], down: [] },
          score: 0,
        };

        // Remove existing vote
        songVote.votes.up = songVote.votes.up.filter((id) => id !== userId);
        songVote.votes.down = songVote.votes.down.filter((id) => id !== userId);

        // Add new vote
        if (voteType === 'up') {
          songVote.votes.up.push(userId);
        } else if (voteType === 'down') {
          songVote.votes.down.push(userId);
        }

        songVote.score = songVote.votes.up.length - songVote.votes.down.length;
        newMap.set(songId, songVote);
        return newMap;
      });

      publishVote({ name: 'vote-action', data: action });
    },
    [userId, userName, isLocked, enabled, publishVote]
  );

  // Upvote shorthand
  const upvote = useCallback((songId: string) => vote(songId, 'up'), [vote]);

  // Downvote shorthand
  const downvote = useCallback((songId: string) => vote(songId, 'down'), [vote]);

  // Clear vote shorthand
  const clearVote = useCallback((songId: string) => vote(songId, 'clear'), [vote]);

  // Lock/unlock voting
  const toggleLock = useCallback(() => {
    if (!publishLock || !enabled) return;

    const newLocked = !isLocked;
    setIsLocked(newLocked);
    publishLock({ name: 'voting-lock', data: { locked: newLocked } });
  }, [isLocked, enabled, publishLock]);

  // Get sorted songs by vote score
  const getSortedSongs = useCallback(() => {
    return [...songs].sort((a, b) => {
      const aVote = votes.get(a.id);
      const bVote = votes.get(b.id);
      return (bVote?.score || 0) - (aVote?.score || 0);
    });
  }, [songs, votes]);

  // Get user's vote for a song
  const getUserVote = useCallback(
    (songId: string): 'up' | 'down' | null => {
      const songVote = votes.get(songId);
      if (!songVote) return null;
      if (songVote.votes.up.includes(userId)) return 'up';
      if (songVote.votes.down.includes(userId)) return 'down';
      return null;
    },
    [votes, userId]
  );

  // Calculate voting progress (how many users have voted)
  const getVotingProgress = useCallback(() => {
    const totalUsers = votingUsers.size;
    const usersWhoVoted = Array.from(votingUsers.values()).filter((u) => u.hasVoted).length;
    return {
      total: totalUsers,
      voted: usersWhoVoted,
      percentage: totalUsers > 0 ? (usersWhoVoted / totalUsers) * 100 : 0,
    };
  }, [votingUsers]);

  // Broadcast presence periodically
  useEffect(() => {
    if (!enabled || !publishPresence) return;

    const broadcastPresence = () => {
      const votedSongs = Array.from(votes.entries())
        .filter(([, v]) => v.votes.up.includes(userId) || v.votes.down.includes(userId))
        .map(([songId]) => songId);

      const user: VotingUser = {
        userId,
        userName,
        hasVoted: votedSongs.length > 0,
        votedSongs,
        lastUpdate: Date.now(),
      };

      publishPresence({ name: 'voting-presence', data: user });
    };

    broadcastPresence();
    const interval = setInterval(broadcastPresence, 3000);

    return () => clearInterval(interval);
  }, [userId, userName, votes, enabled, publishPresence]);

  // Clean up stale users
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setVotingUsers((prev) => {
        const newMap = new Map(prev);
        for (const [key, user] of newMap) {
          if (now - user.lastUpdate > 10000) {
            newMap.delete(key);
          }
        }
        return newMap;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    votes: Array.from(votes.values()),
    votingUsers: Array.from(votingUsers.values()),
    isLocked,
    isConnected,
    error,
    upvote,
    downvote,
    clearVote,
    toggleLock,
    getSortedSongs,
    getUserVote,
    getVotingProgress,
  };
}
