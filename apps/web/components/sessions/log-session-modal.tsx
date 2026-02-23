'use client';

import { Button } from '@cronkwaters/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Music,
  Users,
  FileText,
  Mic2,
  Video as VideoIcon,
  TrendingUp,
  CheckCircle2,
} from '@/components/ui/custom-icons';
import { useState } from 'react';

type SessionType = 'recording' | 'writing' | 'rehearsal' | 'video' | 'mixing' | 'other';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: {
    type: SessionType;
    duration_minutes: number;
    song_id?: string;
    song_title?: string;
    notes: string;
    participants: string[];
    date: string;
  }) => Promise<void>;
  projectSongs: Array<{ id: string; title: string }>;
  projectCollaborators: Array<{ email: string; name?: string }>;
}

const SESSION_TYPES = [
  { type: 'recording' as const, label: 'Recording', icon: Mic2, color: 'red' },
  { type: 'writing' as const, label: 'Songwriting', icon: FileText, color: 'purple' },
  { type: 'rehearsal' as const, label: 'Rehearsal', icon: Users, color: 'blue' },
  { type: 'video' as const, label: 'Video Call', icon: VideoIcon, color: 'green' },
  { type: 'mixing' as const, label: 'Mixing', icon: TrendingUp, color: 'orange' },
  { type: 'other' as const, label: 'Other', icon: Music, color: 'gray' },
];

export default function LogSessionModal({
  isOpen,
  onClose,
  onSave,
  projectSongs,
  projectCollaborators,
}: LogSessionModalProps) {
  const [sessionType, setSessionType] = useState<SessionType>('recording');
  const [duration, setDuration] = useState<{ hours: number; minutes: number }>({
    hours: 0,
    minutes: 30,
  });
  const [selectedSong, setSelectedSong] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const toggleParticipant = (email: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(email) ? prev.filter((p) => p !== email) : [...prev, email]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalMinutes = duration.hours * 60 + duration.minutes;
      const songData = selectedSong ? projectSongs.find((s) => s.id === selectedSong) : undefined;

      await onSave({
        type: sessionType,
        duration_minutes: totalMinutes,
        song_id: selectedSong || undefined,
        song_title: songData?.title,
        notes,
        participants: selectedParticipants,
        date: sessionDate,
      });

      // Reset form
      setSessionType('recording');
      setDuration({ hours: 0, minutes: 30 });
      setSelectedSong('');
      setNotes('');
      setSelectedParticipants([]);
      setSessionDate(new Date().toISOString().split('T')[0]);

      onClose();
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setSaving(false);
    }
  };

  const totalMinutes = duration.hours * 60 + duration.minutes;
  const isValid = totalMinutes > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">Log Session</h2>
                  <p className="text-sm text-muted-foreground">
                    Track your creative work with your team
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 transition-colors hover:bg-surface"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6 p-6">
                {/* Session Type */}
                <div>
                  <label className="mb-3 block text-sm font-semibold">Session Type</label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {SESSION_TYPES.map(({ type, label, icon: Icon, color }) => (
                      <button
                        key={type}
                        onClick={() => setSessionType(type)}
                        className={`rounded-xl border-2 p-4 transition-all ${
                          sessionType === type
                            ? `bg-${color}-500/10 border-${color}-500/50`
                            : 'border-border hover:border-brand-primary/30'
                        }`}
                      >
                        <Icon
                          className={`mb-2 h-6 w-6 ${sessionType === type ? `text-${color}-500` : 'text-muted-foreground'}`}
                        />
                        <p
                          className={`text-sm font-medium ${sessionType === type ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="mb-3 block text-sm font-semibold">Duration</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-muted-foreground">HOURS</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={duration.hours}
                        onChange={(e) =>
                          setDuration({ ...duration, hours: parseInt(e.target.value) || 0 })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-center text-2xl font-bold text-foreground focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                    <span className="mt-6 text-2xl text-muted-foreground">:</span>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-muted-foreground">MINUTES</label>
                      <select
                        value={duration.minutes}
                        onChange={(e) =>
                          setDuration({ ...duration, minutes: parseInt(e.target.value) })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-center text-2xl font-bold text-foreground focus:border-brand-primary focus:outline-none"
                      >
                        {[0, 15, 30, 45].map((min) => (
                          <option key={min} value={min}>
                            {min}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-6 flex-1">
                      <div className="rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-4 py-2 text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-brand-primary">{totalMinutes}m</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-brand-primary focus:outline-none"
                  />
                </div>

                {/* Linked Song (Optional) */}
                {projectSongs.length > 0 && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Linked Song{' '}
                      <span className="font-normal text-muted-foreground">(Optional)</span>
                    </label>
                    <select
                      value={selectedSong}
                      onChange={(e) => setSelectedSong(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-foreground focus:border-brand-primary focus:outline-none"
                    >
                      <option value="">No specific song</option>
                      {projectSongs.map((song) => (
                        <option key={song.id} value={song.id}>
                          {song.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Participants (Collaborative) */}
                <div>
                  <label className="mb-3 block text-sm font-semibold">
                    Participants{' '}
                    <span className="text-xs text-muted-foreground">(Select all who attended)</span>
                  </label>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {projectCollaborators.map((collab) => (
                      <button
                        key={collab.email}
                        onClick={() => toggleParticipant(collab.email)}
                        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-all ${
                          selectedParticipants.includes(collab.email)
                            ? 'border-brand-primary/50 bg-brand-primary/10'
                            : 'border-border hover:border-brand-primary/30'
                        }`}
                      >
                        <span className="text-sm">{collab.name || collab.email}</span>
                        {selectedParticipants.includes(collab.email) && (
                          <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedParticipants.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {selectedParticipants.length} participant
                      {selectedParticipants.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Notes <span className="font-normal text-muted-foreground">(Optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you work on? Any breakthroughs or decisions made?"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground focus:border-brand-primary focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Example: "Recorded vocals for verse 1, decided on Am for the bridge"
                  </p>
                </div>

                {/* Collaborative Note */}
                <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
                  <p className="mb-1 text-sm font-medium text-brand-primary">
                    🤝 Collaborative Tracking
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All project members can see this session. This helps your team coordinate
                    schedules, track contributions, and prepare for royalty split conversations.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background px-6 py-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleSave}
                  disabled={!isValid || saving}
                  className="rnrb-button-primary rounded-lg px-6 py-2 font-semibold disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Log Session'}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
