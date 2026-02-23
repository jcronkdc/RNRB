'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  Target,
  Trophy,
  Music,
  Flame,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Star,
  Loader2,
} from '@/components/ui/custom-icons';
import { Button } from '@cronkwaters/ui';

interface PracticeSession {
  id: string;
  songName: string;
  duration: number; // in seconds
  date: string;
  notes: string;
  rating: number; // 1-5 stars
}

interface PracticeGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetMinutes: number;
  currentMinutes: number;
}

// API Response types
interface ApiPracticeSession {
  id: string;
  title?: string;
  durationMinutes?: number;
  startTime: string;
  notes?: string;
  rating?: number;
  song?: { title: string };
}

interface ApiPracticeGoal {
  id: string;
  type: string;
  targetMinutes: number;
  currentMinutes: number;
}

export function PracticeLogger() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSong, setCurrentSong] = useState('');
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [goals, setGoals] = useState<PracticeGoal[]>([
    { id: 'daily', type: 'daily', targetMinutes: 30, currentMinutes: 0 },
    { id: 'weekly', type: 'weekly', targetMinutes: 180, currentMinutes: 0 },
    { id: 'monthly', type: 'monthly', targetMinutes: 720, currentMinutes: 0 },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Transform API session to component format
  const transformSession = (apiSession: ApiPracticeSession): PracticeSession => ({
    id: apiSession.id,
    songName: apiSession.song?.title || apiSession.title || 'Practice Session',
    duration: (apiSession.durationMinutes || 0) * 60,
    date: apiSession.startTime,
    notes: apiSession.notes || '',
    rating: apiSession.rating || 0,
  });

  // Transform API goal to component format
  const transformGoal = (apiGoal: ApiPracticeGoal): PracticeGoal => ({
    id: apiGoal.id,
    type: apiGoal.type as 'daily' | 'weekly' | 'monthly',
    targetMinutes: apiGoal.targetMinutes,
    currentMinutes: apiGoal.currentMinutes,
  });

  // Fetch data from API (with localStorage fallback)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch from API
      const [sessionsRes, goalsRes] = await Promise.all([
        fetch('/api/tools/practice?limit=50'),
        fetch('/api/tools/practice/goals'),
      ]);

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions((sessionsData.sessions || []).map(transformSession));
      } else if (sessionsRes.status !== 401) {
        // Fallback to localStorage if API fails (not auth error)
        try {
          const savedSessions = localStorage.getItem('practice-sessions');
          if (savedSessions) setSessions(JSON.parse(savedSessions));
        } catch (e) {
          console.warn('Failed to parse practice sessions:', e);
        }
      }

      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        if (goalsData.length > 0) {
          setGoals(goalsData.map(transformGoal));
        }
      }
    } catch {
      // Fallback to localStorage on network error
      const savedSessions = localStorage.getItem('practice-sessions');
      if (savedSessions) {
        try {
          setSessions(JSON.parse(savedSessions));
        } catch (e) {
          console.error('Failed to parse practice sessions:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate practice streak from sessions state
  const calculateStreak = useCallback(() => {
    if (sessions.length === 0) {
      setStreak(0);
      return;
    }

    const dates = [...new Set(sessions.map((s) => s.date.split('T')[0]))].sort().reverse();

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if practiced today or yesterday
    if (dates[0] === today || dates[0] === yesterday) {
      currentStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;

        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    setStreak(currentStreak);
  }, [sessions]);

  // Calculate goal progress
  const calculateGoalProgress = useCallback(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let dailyMinutes = 0;
    let weeklyMinutes = 0;
    let monthlyMinutes = 0;

    sessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      const minutes = Math.floor(session.duration / 60);

      if (sessionDate >= startOfDay) dailyMinutes += minutes;
      if (sessionDate >= startOfWeek) weeklyMinutes += minutes;
      if (sessionDate >= startOfMonth) monthlyMinutes += minutes;
    });

    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.type === 'daily') return { ...goal, currentMinutes: dailyMinutes };
        if (goal.type === 'weekly') return { ...goal, currentMinutes: weeklyMinutes };
        if (goal.type === 'monthly') return { ...goal, currentMinutes: monthlyMinutes };
        return goal;
      })
    );
  }, [sessions]);

  // Calculate goal progress and streak when sessions change
  useEffect(() => {
    calculateGoalProgress();
    calculateStreak();
    // Also save to localStorage as backup
    localStorage.setItem('practice-sessions', JSON.stringify(sessions));
  }, [sessions, calculateStreak, calculateGoalProgress]);

  useEffect(() => {
    localStorage.setItem('practice-goals', JSON.stringify(goals));
  }, [goals]);

  // Timer functions
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - elapsedTime * 1000;
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    setIsRunning(true);
  }, [elapsedTime]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const stopTimer = useCallback(() => {
    pauseTimer();

    if (elapsedTime > 0 && currentSong) {
      const newSession: PracticeSession = {
        id: Date.now().toString(),
        songName: currentSong,
        duration: elapsedTime,
        date: new Date().toISOString(),
        notes: sessionNotes,
        rating: sessionRating,
      };

      setSessions((prev) => [newSession, ...prev]);
      calculateStreak();
    }

    setElapsedTime(0);
    setCurrentSong('');
    setSessionNotes('');
    setSessionRating(0);
  }, [elapsedTime, currentSong, sessionNotes, sessionRating, pauseTimer, calculateStreak]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total practice time
  const totalPracticeTime = sessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="rnrb-card overflow-hidden rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-indigo-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Practice Logger</h3>
            <p className="text-sm text-muted-foreground">Track your practice sessions</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="gap-2 rounded-full"
        >
          <BarChart3 className="h-4 w-4" />
          History
        </Button>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-linear-to-br from-orange-500/20 to-red-500/20 p-4 text-center">
          <Flame className="mx-auto mb-2 h-6 w-6 text-orange-400" />
          <div className="text-2xl font-bold">{streak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-purple-500/20 to-indigo-500/20 p-4 text-center">
          <Music className="mx-auto mb-2 h-6 w-6 text-purple-400" />
          <div className="text-2xl font-bold">{sessions.length}</div>
          <div className="text-xs text-muted-foreground">Sessions</div>
        </div>
        <div className="rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 p-4 text-center">
          <Trophy className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
          <div className="text-2xl font-bold">{Math.floor(totalPracticeTime / 3600)}h</div>
          <div className="text-xs text-muted-foreground">Total Time</div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="mb-6 space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4" />
          Practice Goals
        </h4>
        {goals.map((goal) => {
          const progress = Math.min((goal.currentMinutes / goal.targetMinutes) * 100, 100);
          const isComplete = goal.currentMinutes >= goal.targetMinutes;

          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{goal.type}</span>
                <span className="flex items-center gap-2 font-mono">
                  {goal.currentMinutes}/{goal.targetMinutes} min
                  {isComplete && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full rounded-full ${
                    isComplete
                      ? 'bg-linear-to-r from-emerald-500 to-teal-500'
                      : 'bg-linear-to-r from-purple-500 to-indigo-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Timer Display */}
      <div className="mb-6 text-center">
        <motion.div
          key={elapsedTime}
          initial={{ scale: 1 }}
          animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
          className="font-display text-7xl font-black tracking-tight"
          style={{ color: isRunning ? 'var(--accent)' : 'var(--text)' }}
        >
          {formatTime(elapsedTime)}
        </motion.div>
        {isRunning && currentSong && (
          <p className="mt-2 text-muted-foreground">
            Practicing: <span className="font-semibold text-white">{currentSong}</span>
          </p>
        )}
      </div>

      {/* Song Input */}
      {!isRunning && elapsedTime === 0 && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">What are you practicing?</label>
          <input
            type="text"
            value={currentSong}
            onChange={(e) => setCurrentSong(e.target.value)}
            placeholder="Song name, technique, scales..."
            className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 focus:border-brand-primary focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      )}

      {/* Session Notes (while paused) */}
      {!isRunning && elapsedTime > 0 && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Session Notes</label>
            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="What did you work on? Any breakthroughs?"
              rows={3}
              className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 focus:border-brand-primary focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Rate This Session</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSessionRating(rating)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= sessionRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isRunning && elapsedTime === 0 ? (
          <Button
            onClick={startTimer}
            disabled={!currentSong.trim()}
            className="gap-2 rounded-full bg-linear-to-r from-purple-500 to-indigo-600 px-8 py-6 text-lg font-bold hover:from-purple-600 hover:to-indigo-700"
          >
            <Play className="h-5 w-5" />
            Start Practice
          </Button>
        ) : (
          <>
            <Button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`gap-2 rounded-full px-8 py-6 text-lg font-bold ${
                isRunning
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Resume
                </>
              )}
            </Button>
            <Button
              onClick={stopTimer}
              variant="outline"
              className="gap-2 rounded-full px-8 py-6 text-lg font-bold"
            >
              <Square className="h-5 w-5" />
              Save Session
            </Button>
          </>
        )}
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-6 overflow-hidden"
          >
            <div className="space-y-3 rounded-xl bg-white/5 p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4" />
                Recent Sessions
              </h4>

              {sessions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No practice sessions yet. Start your first one!
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {sessions.slice(0, 10).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg bg-white/5 p-3"
                    >
                      <div>
                        <div className="font-medium">{session.songName}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                          {session.rating > 0 && (
                            <span className="flex items-center gap-0.5">
                              {Array.from({ length: session.rating }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {formatTime(session.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Weekly Summary */}
              {sessions.length > 0 && (
                <div className="mt-4 rounded-lg bg-linear-to-r from-purple-500/10 to-indigo-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-semibold">This Week</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Practice time:</span>
                    <span className="font-mono font-bold">
                      {Math.floor(goals.find((g) => g.type === 'weekly')?.currentMinutes || 0)} min
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
