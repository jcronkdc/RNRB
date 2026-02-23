'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  Plus,
  Search,
  Mic,
  Speaker,
  Sliders,
  Calendar,
  Tag,
  Copy,
  Download,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  Music,
  Save,
  Loader2,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

interface SessionNote {
  id: string;
  title: string;
  date: string;
  songName: string;
  trackType: 'vocals' | 'guitar' | 'bass' | 'drums' | 'keys' | 'other';
  microphone: string;
  preamp: string;
  eq: string;
  compression: string;
  effects: string[];
  signalChain: string[];
  position: string;
  settings: string;
  notes: string;
  tags: string[];
}

// API Response type
interface ApiRecordingNote {
  id: string;
  title: string;
  date?: string;
  createdAt: string;
  song?: { title: string };
  instrument?: string;
  microphone?: string;
  preamp?: string;
  settings?: Record<string, unknown>;
  signalChain?: string;
  notes?: string;
  whatWorked?: string;
  whatToImprove?: string;
  tags?: string[];
}

const TRACK_TYPES = [
  { id: 'vocals', name: 'Vocals', color: '#ec4899' },
  { id: 'guitar', name: 'Guitar', color: '#3b82f6' },
  { id: 'bass', name: 'Bass', color: '#22c55e' },
  { id: 'drums', name: 'Drums', color: '#eab308' },
  { id: 'keys', name: 'Keys', color: '#a855f7' },
  { id: 'other', name: 'Other', color: '#6b7280' },
];

const POPULAR_MICS = [
  'Shure SM57',
  'Shure SM58',
  'Shure SM7B',
  'Neumann U87',
  'Neumann TLM 103',
  'AKG C414',
  'AKG C12',
  'Sennheiser MD421',
  'Sennheiser e609',
  'Rode NT1',
  'Rode NT5',
  'Audio-Technica AT4050',
  'Audio-Technica AT2020',
  'Electro-Voice RE20',
  'Beyerdynamic M160',
];

const DEFAULT_SESSION: Partial<SessionNote> = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  songName: '',
  trackType: 'vocals',
  microphone: '',
  preamp: '',
  eq: '',
  compression: '',
  effects: [],
  signalChain: [],
  position: '',
  settings: '',
  notes: '',
  tags: [],
};

export function SessionNotes() {
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingSession, setEditingSession] = useState<Partial<SessionNote>>(DEFAULT_SESSION);
  const [expandedSessions, setExpandedSessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Transform API response to component format
  const transformApiNote = (apiNote: ApiRecordingNote): SessionNote => ({
    id: apiNote.id,
    title: apiNote.title,
    date: apiNote.date || apiNote.createdAt.split('T')[0],
    songName: apiNote.song?.title || '',
    trackType: (apiNote.instrument as SessionNote['trackType']) || 'other',
    microphone: apiNote.microphone || '',
    preamp: apiNote.preamp || '',
    eq: (apiNote.settings as Record<string, string>)?.eq || '',
    compression: (apiNote.settings as Record<string, string>)?.compression || '',
    effects: [],
    signalChain: apiNote.signalChain ? apiNote.signalChain.split(' → ') : [],
    position: '',
    settings: JSON.stringify(apiNote.settings || {}),
    notes: [apiNote.notes, apiNote.whatWorked, apiNote.whatToImprove].filter(Boolean).join('\n\n'),
    tags: apiNote.tags || [],
  });

  // Fetch notes from API with localStorage fallback
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tools/recording-notes?limit=50');
      if (res.ok) {
        const data = await res.json();
        setSessions((data || []).map(transformApiNote));
      } else if (res.status !== 401) {
        // Fallback to localStorage on API error (not auth)
        try {
          const saved = localStorage.getItem('session-notes');
          if (saved) setSessions(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to parse session notes:', e);
        }
      }
    } catch {
      // Fallback to localStorage on network error
      const saved = localStorage.getItem('session-notes');
      if (saved) {
        try {
          setSessions(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load session notes:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Also save to localStorage as backup
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('session-notes', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.microphone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || session.trackType === filterType;
    return matchesSearch && matchesType;
  });

  // Save session to API
  const saveSession = async () => {
    if (!editingSession.title) return;

    const session: SessionNote = {
      id: editingSession.id || `session-${Date.now()}`,
      title: editingSession.title || '',
      date: editingSession.date || new Date().toISOString().split('T')[0],
      songName: editingSession.songName || '',
      trackType: editingSession.trackType || 'vocals',
      microphone: editingSession.microphone || '',
      preamp: editingSession.preamp || '',
      eq: editingSession.eq || '',
      compression: editingSession.compression || '',
      effects: editingSession.effects || [],
      signalChain: editingSession.signalChain || [],
      position: editingSession.position || '',
      settings: editingSession.settings || '',
      notes: editingSession.notes || '',
      tags: editingSession.tags || [],
    };

    setSaving(true);
    try {
      const apiPayload = {
        title: session.title,
        instrument: session.trackType,
        microphone: session.microphone || null,
        preamp: session.preamp || null,
        settings: {
          eq: session.eq,
          compression: session.compression,
          raw: session.settings,
        },
        signalChain: session.signalChain.join(' → ') || null,
        notes: session.notes || null,
        tags: session.tags,
      };

      if (editingSession.id) {
        const res = await fetch('/api/tools/recording-notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingSession.id, ...apiPayload }),
        });
        if (res.ok) {
          setSessions(sessions.map((s) => (s.id === session.id ? session : s)));
        } else {
          // Fallback to local state update
          setSessions(sessions.map((s) => (s.id === session.id ? session : s)));
        }
      } else {
        const res = await fetch('/api/tools/recording-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload),
        });
        if (res.ok) {
          const newNote = await res.json();
          setSessions([transformApiNote(newNote), ...sessions]);
        } else {
          // Fallback to local state update
          setSessions([session, ...sessions]);
        }
      }
    } catch {
      // Fallback to local state on error
      if (editingSession.id) {
        setSessions(sessions.map((s) => (s.id === session.id ? session : s)));
      } else {
        setSessions([session, ...sessions]);
      }
    } finally {
      setSaving(false);
    }

    setShowEditor(false);
    setEditingSession(DEFAULT_SESSION);
  };

  // Delete session
  const deleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedSessions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Copy to clipboard
  const copySession = (session: SessionNote) => {
    const text = `
${session.title}
Song: ${session.songName}
Date: ${session.date}

Signal Chain:
- Microphone: ${session.microphone}
- Preamp: ${session.preamp}
- EQ: ${session.eq}
- Compression: ${session.compression}
- Effects: ${session.effects.join(', ')}

Position: ${session.position}
Settings: ${session.settings}

Notes:
${session.notes}
    `.trim();
    navigator.clipboard.writeText(text);
  };

  // Get color for track type
  const getTypeColor = (type: string) => {
    return TRACK_TYPES.find((t) => t.id === type)?.color || '#6b7280';
  };

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
            <ClipboardList className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Recording Session Notes</h3>
            <p className="text-sm text-muted-foreground">{sessions.length} sessions documented</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingSession(DEFAULT_SESSION);
            setShowEditor(true);
          }}
          className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-600"
        >
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full rounded-xl border border-border bg-white/5 py-2 pl-10 pr-4 focus:border-brand-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${
              filterType === 'all' ? 'bg-brand-primary text-white' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            All
          </button>
          {TRACK_TYPES.slice(0, 4).map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                filterType === type.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-xl bg-white/5 py-12 text-center">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No session notes yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Document your recording setups to recreate great sounds!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const isExpanded = expandedSessions.includes(session.id);

            return (
              <motion.div key={session.id} layout className="overflow-hidden rounded-xl bg-white/5">
                {/* Header */}
                <div
                  className="flex cursor-pointer items-center gap-4 p-4"
                  onClick={() => toggleExpand(session.id)}
                >
                  <button>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>

                  <div
                    className="h-10 w-10 flex-shrink-0 rounded-lg"
                    style={{ backgroundColor: getTypeColor(session.trackType) + '30' }}
                  >
                    <div className="flex h-full items-center justify-center">
                      <Mic className="h-5 w-5" style={{ color: getTypeColor(session.trackType) }} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold">{session.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{session.songName}</span>
                      <span>•</span>
                      <span>{session.microphone}</span>
                      <span>•</span>
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => copySession(session)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSession(session);
                        setShowEditor(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400"
                      onClick={() => deleteSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border p-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Signal Chain */}
                          <div className="space-y-3">
                            <h5 className="flex items-center gap-2 text-sm font-semibold">
                              <Sliders className="h-4 w-4" />
                              Signal Chain
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                                <span className="text-muted-foreground">Microphone</span>
                                <span>{session.microphone || '-'}</span>
                              </div>
                              <div className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                                <span className="text-muted-foreground">Preamp</span>
                                <span>{session.preamp || '-'}</span>
                              </div>
                              <div className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                                <span className="text-muted-foreground">EQ</span>
                                <span>{session.eq || '-'}</span>
                              </div>
                              <div className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                                <span className="text-muted-foreground">Compression</span>
                                <span>{session.compression || '-'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Position & Settings */}
                          <div className="space-y-3">
                            <h5 className="flex items-center gap-2 text-sm font-semibold">
                              <Mic className="h-4 w-4" />
                              Position & Settings
                            </h5>
                            <div className="rounded-lg bg-white/5 p-3 text-sm">
                              <p className="mb-2">
                                <strong>Position:</strong> {session.position || 'Not specified'}
                              </p>
                              <p>
                                <strong>Settings:</strong> {session.settings || 'Not specified'}
                              </p>
                            </div>

                            {session.effects.length > 0 && (
                              <div>
                                <h6 className="mb-2 text-xs text-muted-foreground">Effects</h6>
                                <div className="flex flex-wrap gap-1">
                                  {session.effects.map((effect, i) => (
                                    <span
                                      key={i}
                                      className="rounded-full bg-white/10 px-2 py-0.5 text-xs"
                                    >
                                      {effect}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes */}
                        {session.notes && (
                          <div className="mt-4">
                            <h5 className="mb-2 text-sm font-semibold">Notes</h5>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                              {session.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-6 text-lg font-bold">
                {editingSession.id ? 'Edit Session' : 'New Session Notes'}
              </h3>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Session Title</label>
                    <input
                      type="text"
                      value={editingSession.title || ''}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, title: e.target.value })
                      }
                      placeholder="e.g., Lead Vocal Take 3"
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Song Name</label>
                    <input
                      type="text"
                      value={editingSession.songName || ''}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, songName: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Track Type</label>
                    <select
                      value={editingSession.trackType || 'vocals'}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, trackType: e.target.value as any })
                      }
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    >
                      {TRACK_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Date</label>
                    <input
                      type="date"
                      value={editingSession.date || ''}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, date: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                </div>

                {/* Signal Chain */}
                <div className="space-y-4 rounded-xl bg-white/5 p-4">
                  <h4 className="font-semibold">Signal Chain</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Microphone</label>
                      <input
                        type="text"
                        value={editingSession.microphone || ''}
                        onChange={(e) =>
                          setEditingSession({ ...editingSession, microphone: e.target.value })
                        }
                        list="mics"
                        placeholder="e.g., Shure SM7B"
                        className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                      />
                      <datalist id="mics">
                        {POPULAR_MICS.map((mic) => (
                          <option key={mic} value={mic} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Preamp</label>
                      <input
                        type="text"
                        value={editingSession.preamp || ''}
                        onChange={(e) =>
                          setEditingSession({ ...editingSession, preamp: e.target.value })
                        }
                        placeholder="e.g., UA 610"
                        className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">EQ</label>
                      <input
                        type="text"
                        value={editingSession.eq || ''}
                        onChange={(e) =>
                          setEditingSession({ ...editingSession, eq: e.target.value })
                        }
                        placeholder="e.g., API 550A"
                        className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Compression</label>
                      <input
                        type="text"
                        value={editingSession.compression || ''}
                        onChange={(e) =>
                          setEditingSession({ ...editingSession, compression: e.target.value })
                        }
                        placeholder="e.g., LA-2A"
                        className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Position & Settings */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Mic Position</label>
                    <textarea
                      value={editingSession.position || ''}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, position: e.target.value })
                      }
                      placeholder="e.g., 3 inches off grill, 45° angle"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Key Settings</label>
                    <textarea
                      value={editingSession.settings || ''}
                      onChange={(e) =>
                        setEditingSession({ ...editingSession, settings: e.target.value })
                      }
                      placeholder="e.g., Gain at 2 o'clock, HPF at 80Hz"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Additional Notes</label>
                  <textarea
                    value={editingSession.notes || ''}
                    onChange={(e) =>
                      setEditingSession({ ...editingSession, notes: e.target.value })
                    }
                    placeholder="Any other details worth remembering..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-white/5 px-4 py-2"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={saveSession}
                  disabled={!editingSession.title || !editingSession.songName}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Session
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
