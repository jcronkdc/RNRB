/**
 * Real-Time Collaboration Components
 *
 * A suite of components for collaborative music creation.
 * Built on Ably for real-time synchronization.
 */

// Components
export { SetlistVoting } from './setlist-voting';
export { AudioAnnotationTimeline } from './audio-annotation-timeline';
export { LiveTeleprompter } from './live-teleprompter';
export { CollaborativeLyricsEditor } from './collaborative-lyrics-editor';
export { SynchronizedAudioPlayer } from './synchronized-audio-player';
export { LiveChordAnnotation } from './live-chord-annotation';

// Hooks (re-export for convenience)
export { useCollaborativeLyrics } from '@/hooks/use-collaborative-lyrics';
export { useSynchronizedPlayback } from '@/hooks/use-synchronized-playback';
export { useSetlistVoting } from '@/hooks/use-setlist-voting';
export { useAudioAnnotations } from '@/hooks/use-audio-annotations';
export { useTeleprompterSync } from '@/hooks/use-teleprompter-sync';
export { useLiveChordAnnotation } from '@/hooks/use-live-chord-annotation';

// Types
export type {
  CursorInfo,
  LyricEdit,
  SectionLock,
  LyricSuggestion,
} from '@/hooks/use-collaborative-lyrics';

export type {
  PlaybackState,
  PlaybackCommand,
  PlaybackUser,
} from '@/hooks/use-synchronized-playback';

export type { SetlistSong, SongVote, VoteAction, VotingUser } from '@/hooks/use-setlist-voting';

export type {
  AudioAnnotation,
  AnnotationReply,
  AnnotationAction,
} from '@/hooks/use-audio-annotations';

export type {
  TeleprompterState,
  TeleprompterCommand,
  TeleprompterUser,
} from '@/hooks/use-teleprompter-sync';

export type {
  ChordAnnotation,
  ChordSuggestion,
  ChordAction,
} from '@/hooks/use-live-chord-annotation';
