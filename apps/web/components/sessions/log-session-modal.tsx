'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Music, Users, FileText, Mic2, Video as VideoIcon, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@cronkwaters/ui';

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
  const [duration, setDuration] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 30 });
  const [selectedSong, setSelectedSong] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const toggleParticipant = (email: string) => {
    setSelectedParticipants(prev =>
      prev.includes(email)
        ? prev.filter(p => p !== email)
        : [...prev, email]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalMinutes = duration.hours * 60 + duration.minutes;
      const songData = selectedSong ? projectSongs.find(s => s.id === selectedSong) : undefined;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-2xl shadow-2xl pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold">Log Session</h2>
                  <p className="text-sm text-muted-foreground">Track your creative work with your team</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Session Type */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Session Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SESSION_TYPES.map(({ type, label, icon: Icon, color }) => (
                      <button
                        key={type}
                        onClick={() => setSessionType(type)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          sessionType === type
                            ? `bg-${color}-500/10 border-${color}-500/50`
                            : 'border-border hover:border-brand-primary/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${sessionType === type ? `text-${color}-500` : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${sessionType === type ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Duration</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground block mb-1">HOURS</label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={duration.hours}
                        onChange={(e) => setDuration({ ...duration, hours: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none text-center text-2xl font-bold"
                      />
                    </div>
                    <span className="text-2xl text-muted-foreground mt-6">:</span>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground block mb-1">MINUTES</label>
                      <select
                        value={duration.minutes}
                        onChange={(e) => setDuration({ ...duration, minutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none text-center text-2xl font-bold"
                      >
                        {[0, 15, 30, 45].map(min => (
                          <option key={min} value={min}>{min}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 mt-6">
                      <div className="px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-brand-primary">{totalMinutes}m</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                  />
                </div>

                {/* Linked Song (Optional) */}
                {projectSongs.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Linked Song <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <select
                      value={selectedSong}
                      onChange={(e) => setSelectedSong(e.target.value)}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none"
                    >
                      <option value="">No specific song</option>
                      {projectSongs.map(song => (
                        <option key={song.id} value={song.id}>{song.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Participants (Collaborative) */}
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Participants <span className="text-xs text-muted-foreground">(Select all who attended)</span>
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {projectCollaborators.map((collab) => (
                      <button
                        key={collab.email}
                        onClick={() => toggleParticipant(collab.email)}
                        className={`w-full px-4 py-3 rounded-lg border transition-all text-left flex items-center justify-between ${
                          selectedParticipants.includes(collab.email)
                            ? 'bg-brand-primary/10 border-brand-primary/50'
                            : 'border-border hover:border-brand-primary/30'
                        }`}
                      >
                        <span className="text-sm">
                          {collab.name || collab.email}
                        </span>
                        {selectedParticipants.includes(collab.email) && (
                          <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                  {selectedParticipants.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedParticipants.length} participant{selectedParticipants.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you work on? Any breakthroughs or decisions made?"
                    rows={4}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:border-brand-primary focus:outline-none resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Example: "Recorded vocals for verse 1, decided on Am for the bridge"
                  </p>
                </div>

                {/* Collaborative Note */}
                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-brand-primary font-medium mb-1">
                    🤝 Collaborative Tracking
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All project members can see this session. This helps your team coordinate schedules, 
                    track contributions, and prepare for royalty split conversations.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleSave}
                  disabled={!isValid || saving}
                  className="rnrb-button-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
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

