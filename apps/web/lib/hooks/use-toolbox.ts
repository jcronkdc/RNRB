/**
 * Toolbox Hooks - Mycelial Integration
 * Shared hooks for all toolbox components to access database
 */

import { useState, useEffect, useCallback } from 'react';

// Types
export interface GearItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  location?: string;
  notes?: string;
  tags: string[];
  imageUrl?: string;
  isFavorite: boolean;
  insured: boolean;
  insurancePolicy?: string;
  insuranceValue?: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GearStats {
  totalItems: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;
  totalInsuranceValue: number;
}

export interface PracticeSession {
  id: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  songId?: string;
  focusArea?: string;
  instruments: string[];
  rating?: number;
  energyLevel?: number;
  notes?: string;
  goalId?: string;
  goalProgress?: number;
  song?: { id: string; title: string; key?: string; tempo?: number };
  goal?: { id: string; title: string; targetMinutes: number };
}

export interface PracticeGoal {
  id: string;
  title: string;
  description?: string;
  targetMinutes: number;
  period: 'daily' | 'weekly' | 'monthly';
  currentMinutes: number;
  streak: number;
  longestStreak: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  sessions?: { id: string; startTime: string; durationMinutes?: number; rating?: number }[];
  _count?: { sessions: number };
}

export interface PracticeStats {
  thisWeek: { totalMinutes: number; sessionCount: number; avgRating: number };
  thisMonth: { totalMinutes: number; sessionCount: number };
  allTime: { totalMinutes: number; sessionCount: number };
}

export interface RecordingNote {
  id: string;
  title: string;
  date: string;
  projectId?: string;
  songId?: string;
  studioSessionId?: string;
  engineer?: string;
  studio?: string;
  signalChain?: Record<string, unknown>;
  micPosition?: string;
  micType?: string;
  micDistance?: string;
  preampSettings?: Record<string, unknown>;
  eqSettings?: Record<string, unknown>;
  compressionSettings?: Record<string, unknown>;
  otherFx?: Record<string, unknown>;
  referenceFiles: string[];
  screenshots: string[];
  notes?: string;
  whatWorked?: string;
  whatToImprove?: string;
  tags: string[];
  project?: { id: string; name: string; slug: string };
  song?: { id: string; title: string };
  studioSession?: { id: string; title: string; startTime: string };
}

// Gear Inventory Hook
export function useGearInventory() {
  const [gear, setGear] = useState<GearItem[]>([]);
  const [stats, setStats] = useState<GearStats>({
    totalItems: 0,
    totalPurchaseValue: 0,
    totalCurrentValue: 0,
    totalInsuranceValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGear = useCallback(async (category?: string) => {
    try {
      setLoading(true);
      const url =
        category && category !== 'all' ? `/api/tools/gear?category=${category}` : '/api/tools/gear';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch gear');
      const data = await res.json();
      setGear(data.gear || []);
      setStats(
        data.stats || {
          totalItems: 0,
          totalPurchaseValue: 0,
          totalCurrentValue: 0,
          totalInsuranceValue: 0,
        }
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addGear = useCallback(async (item: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/tools/gear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add gear');
    const newItem = await res.json();
    setGear((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateGear = useCallback(async (id: string, updates: Partial<GearItem>) => {
    const res = await fetch('/api/tools/gear', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update gear');
    const updated = await res.json();
    setGear((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGear = useCallback(async (id: string) => {
    const res = await fetch(`/api/tools/gear?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete gear');
    setGear((prev) => prev.filter((g) => g.id !== id));
  }, []);

  useEffect(() => {
    fetchGear();
  }, [fetchGear]);

  return { gear, stats, loading, error, fetchGear, addGear, updateGear, deleteGear };
}

// Practice Sessions Hook
export function usePracticeSessions() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(
    async (options?: { songId?: string; startDate?: string; endDate?: string; limit?: number }) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (options?.songId) params.set('songId', options.songId);
        if (options?.startDate) params.set('startDate', options.startDate);
        if (options?.endDate) params.set('endDate', options.endDate);
        if (options?.limit) params.set('limit', options.limit.toString());

        const res = await fetch(`/api/tools/practice?${params}`);
        if (!res.ok) throw new Error('Failed to fetch sessions');
        const data = await res.json();
        setSessions(data.sessions || []);
        setStats(data.stats || null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const startSession = useCallback(
    async (data: {
      songId?: string;
      focusArea?: string;
      instruments?: string[];
      goalId?: string;
    }) => {
      const res = await fetch('/api/tools/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startTime: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to start session');
      const newSession = await res.json();
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    },
    []
  );

  const endSession = useCallback(
    async (id: string, data: { rating?: number; energyLevel?: number; notes?: string }) => {
      const res = await fetch('/api/tools/practice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, endTime: new Date().toISOString(), ...data }),
      });
      if (!res.ok) throw new Error('Failed to end session');
      const updated = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return updated;
    },
    []
  );

  const deleteSession = useCallback(async (id: string) => {
    const res = await fetch(`/api/tools/practice?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete session');
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    stats,
    loading,
    error,
    fetchSessions,
    startSession,
    endSession,
    deleteSession,
  };
}

// Practice Goals Hook
export function usePracticeGoals() {
  const [goals, setGoals] = useState<PracticeGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async (activeOnly = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tools/practice/goals?activeOnly=${activeOnly}`);
      if (!res.ok) throw new Error('Failed to fetch goals');
      const data = await res.json();
      setGoals(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addGoal = useCallback(
    async (goal: {
      title: string;
      description?: string;
      targetMinutes: number;
      period?: string;
    }) => {
      const res = await fetch('/api/tools/practice/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      if (!res.ok) throw new Error('Failed to add goal');
      const newGoal = await res.json();
      setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    },
    []
  );

  const updateGoal = useCallback(async (id: string, updates: Partial<PracticeGoal>) => {
    const res = await fetch('/api/tools/practice/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    const updated = await res.json();
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const res = await fetch(`/api/tools/practice/goals?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete goal');
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return { goals, loading, error, fetchGoals, addGoal, updateGoal, deleteGoal };
}

// Recording Notes Hook
export function useRecordingNotes() {
  const [notes, setNotes] = useState<RecordingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(
    async (options?: { projectId?: string; songId?: string; limit?: number }) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (options?.projectId) params.set('projectId', options.projectId);
        if (options?.songId) params.set('songId', options.songId);
        if (options?.limit) params.set('limit', options.limit.toString());

        const res = await fetch(`/api/tools/recording-notes?${params}`);
        if (!res.ok) throw new Error('Failed to fetch notes');
        const data = await res.json();
        setNotes(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addNote = useCallback(
    async (note: Omit<RecordingNote, 'id' | 'createdAt' | 'updatedAt'>) => {
      const res = await fetch('/api/tools/recording-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (!res.ok) throw new Error('Failed to add note');
      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    },
    []
  );

  const updateNote = useCallback(async (id: string, updates: Partial<RecordingNote>) => {
    const res = await fetch('/api/tools/recording-notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update note');
    const updated = await res.json();
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const res = await fetch(`/api/tools/recording-notes?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete note');
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, loading, error, fetchNotes, addNote, updateNote, deleteNote };
}
