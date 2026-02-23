'use client';

/**
 * Setlist Voting Component
 *
 * Band members vote on song order in real-time.
 * Democratic setlist building with live vote counts.
 */

import { motion, AnimatePresence } from 'motion/react';
import {
  ThumbsUp,
  ThumbsDown,
  Lock,
  Unlock,
  Music,
  Clock,
  Check,
  Users,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

import { useSetlistVoting, type SetlistSong } from '@/hooks/use-setlist-voting';

interface SetlistVotingProps {
  channelName: string;
  userId: string;
  userName: string;
  songs: SetlistSong[];
  onOrderFinalized?: (songs: SetlistSong[]) => void;
}

export function SetlistVoting({
  channelName,
  userId,
  userName,
  songs,
  onOrderFinalized,
}: SetlistVotingProps) {
  const {
    votes,
    votingUsers,
    isLocked,
    isConnected,
    upvote,
    downvote,
    clearVote,
    toggleLock,
    getSortedSongs,
    getUserVote,
    getVotingProgress,
  } = useSetlistVoting({
    channelName,
    userId,
    userName,
    songs,
  });

  const sortedSongs = getSortedSongs();
  const progress = getVotingProgress();

  const handleFinalize = () => {
    if (onOrderFinalized) {
      onOrderFinalized(sortedSongs);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVoteForSong = (songId: string) => {
    return votes.find((v) => v.songId === songId);
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent-soft)' }}
          >
            <Music className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
              Setlist Voting
            </h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {isConnected ? (
                <>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                  {votingUsers.length} voting
                </>
              ) : (
                'Connecting...'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isLocked ? 'default' : 'outline'}
            size="sm"
            onClick={toggleLock}
            className="flex items-center gap-2"
          >
            {isLocked ? (
              <>
                <Lock className="h-4 w-4" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Lock Votes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Voting Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span style={{ color: 'var(--muted)' }}>Voting Progress</span>
          <span style={{ color: 'var(--text)' }}>
            {progress.voted}/{progress.total} voted
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--bg)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Voters */}
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-4 w-4" style={{ color: 'var(--muted)' }} />
        <div className="flex -space-x-2">
          {votingUsers.slice(0, 5).map((user) => (
            <div
              key={user.userId}
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
              style={{
                background: user.hasVoted ? 'var(--success)' : 'var(--panel-hover)',
                color: user.hasVoted ? 'white' : 'var(--text)',
                border: '2px solid var(--panel)',
              }}
              title={`${user.userName}${user.hasVoted ? ' (voted)' : ''}`}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
          ))}
          {votingUsers.length > 5 && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
              style={{ background: 'var(--panel-hover)', border: '2px solid var(--panel)' }}
            >
              +{votingUsers.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedSongs.map((song, index) => {
            const vote = getVoteForSong(song.id);
            const userVote = getUserVote(song.id);
            const score = vote?.score || 0;

            return (
              <motion.div
                key={song.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 rounded-xl p-4"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Position */}
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  style={{
                    background: index < 3 ? 'var(--accent)' : 'var(--panel)',
                    color: index < 3 ? 'white' : 'var(--text)',
                  }}
                >
                  {index + 1}
                </div>

                {/* Song Info */}
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-medium" style={{ color: 'var(--text)' }}>
                    {song.title}
                  </h4>
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: 'var(--muted)' }}
                  >
                    {song.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(song.duration)}
                      </span>
                    )}
                    {song.key && <span>Key: {song.key}</span>}
                    {song.tempo && <span>{song.tempo} BPM</span>}
                  </div>
                </div>

                {/* Score */}
                <div
                  className="flex h-10 w-16 items-center justify-center rounded-lg text-lg font-bold"
                  style={{
                    background:
                      score > 0
                        ? 'rgba(34, 197, 94, 0.15)'
                        : score < 0
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'var(--panel)',
                    color: score > 0 ? '#22c55e' : score < 0 ? '#ef4444' : 'var(--muted)',
                  }}
                >
                  {score > 0 ? `+${score}` : score}
                </div>

                {/* Vote Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => (userVote === 'up' ? clearVote(song.id) : upvote(song.id))}
                    disabled={isLocked}
                    className="rounded-lg p-2 transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: userVote === 'up' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                      color: userVote === 'up' ? '#22c55e' : 'var(--muted)',
                    }}
                    title="Upvote"
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => (userVote === 'down' ? clearVote(song.id) : downvote(song.id))}
                    disabled={isLocked}
                    className="rounded-lg p-2 transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: userVote === 'down' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                      color: userVote === 'down' ? '#ef4444' : 'var(--muted)',
                    }}
                    title="Downvote"
                  >
                    <ThumbsDown className="h-5 w-5" />
                  </button>
                </div>

                {/* Vote Counts */}
                <div
                  className="flex flex-col items-center text-xs"
                  style={{ color: 'var(--muted)' }}
                >
                  <span className="text-green-500">{vote?.votes.up.length || 0}</span>
                  <span className="text-red-500">{vote?.votes.down.length || 0}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Finalize Button */}
      {isLocked && onOrderFinalized && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Button
            onClick={handleFinalize}
            className="w-full"
            style={{ background: 'var(--accent)' }}
          >
            <Check className="mr-2 h-4 w-4" />
            Finalize Setlist Order
          </Button>
        </motion.div>
      )}

      {/* Total Duration */}
      <div
        className="mt-4 flex items-center justify-between rounded-xl p-3"
        style={{ background: 'var(--bg)' }}
      >
        <span style={{ color: 'var(--muted)' }}>Total Duration</span>
        <span className="font-mono font-medium" style={{ color: 'var(--text)' }}>
          {formatDuration(sortedSongs.reduce((acc, s) => acc + (s.duration || 0), 0))}
        </span>
      </div>
    </div>
  );
}
