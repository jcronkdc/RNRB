'use client';

import { motion } from 'motion/react';
import {
  Video,
  Link2 as LinkIcon,
  Clock,
  Users,
  Copy,
  Calendar,
  CalendarPlus,
  Check,
  Sparkles,
  Monitor,
  Radio,
  // Custom musician icons
  Calendar as TourCalendar,
  Users as BandMembers,
} from '@/components/ui/custom-icons';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { EmptyState } from '@/components/empty-states';
import { ThemeLogo } from '@/components/theme';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  meetingCode: string;
  joinUrl: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  participantCount: number;
  myRole?: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
}

function MeetingCard({
  meeting,
  onJoin,
  onCopy,
  index,
}: {
  meeting: Meeting;
  onJoin: () => void;
  onCopy: () => void;
  index: number;
}) {
  const isActive = meeting.status === 'active';
  const isScheduled = meeting.status === 'scheduled';
  const isPast = meeting.status === 'ended';

  const scheduledTime = meeting.scheduledStartAt
    ? new Date(meeting.scheduledStartAt).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isActive
          ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-white/[0.02] hover:border-green-500/50'
          : isPast
            ? 'border-white/5 bg-white/[0.02] opacity-60'
            : 'border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/20 hover:shadow-xl hover:shadow-black/20'
      }`}
    >
      {/* Gradient glow on hover */}
      <div
        className={`pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br ${
          isActive ? 'from-green-500 to-emerald-600' : 'from-brand-primary to-orange-500'
        } opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-10`}
      />

      {/* Active indicator line */}
      {isActive && (
        <div className="absolute left-4 right-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-green-500 to-emerald-400" />
      )}

      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-3">
              {isActive && (
                <span className="flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                  </span>
                  Live Now
                </span>
              )}
              {isScheduled && scheduledTime && (
                <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                  <Clock className="h-4 w-4" />
                  {scheduledTime}
                </span>
              )}
            </div>

            <h3 className="mb-2 truncate text-lg font-semibold text-white">{meeting.title}</h3>

            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {meeting.participantCount}{' '}
                {meeting.participantCount === 1 ? 'participant' : 'participants'}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">
                {meeting.meetingCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              title="Copy meeting link"
            >
              <Copy className="h-4 w-4" />
            </button>

            {!isPast && (
              <button
                onClick={onJoin}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                    : 'bg-gradient-to-r from-brand-primary to-orange-500 text-white shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40'
                }`}
              >
                {isActive ? 'Join Now' : 'Start'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MeetPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // Schedule form state
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState('60');

  useEffect(() => {
    fetchMeetings();
  }, []);

  async function fetchMeetings() {
    try {
      const res = await fetch('/api/meet?type=upcoming');
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createInstantMeeting() {
    setIsCreating(true);
    try {
      const res = await fetch('/api/meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Quick Meeting',
          type: 'instant',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/meet/${data.meeting.meetingCode}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create meeting');
      }
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  }

  async function createScheduledMeeting() {
    if (!scheduleTitle.trim() || !scheduleDate || !scheduleTime) {
      alert('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    try {
      const startDate = new Date(`${scheduleDate}T${scheduleTime}`);
      const endDate = new Date(startDate.getTime() + parseInt(scheduleDuration) * 60000);

      const res = await fetch('/api/meet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: scheduleTitle.trim(),
          type: 'scheduled',
          scheduledStartAt: startDate.toISOString(),
          scheduledEndAt: endDate.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setShowSchedule(false);
        setScheduleTitle('');
        setScheduleDate('');
        setScheduleTime('');
        fetchMeetings();
        navigator.clipboard.writeText(data.meeting.joinUrl);
        setCopied('scheduled');
        setTimeout(() => setCopied(null), 3000);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    } finally {
      setIsCreating(false);
    }
  }

  function handleJoinByCode() {
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toLowerCase().replace(/\s+/g, '-');
    router.push(`/meet/${code}`);
  }

  function handleCopyLink(meeting: Meeting) {
    navigator.clipboard.writeText(meeting.joinUrl);
    setCopied(meeting.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const activeMeetings = meetings.filter((m) => m.status === 'active');
  const upcomingMeetings = meetings.filter((m) => m.status === 'scheduled');

  const FEATURES = [
    { icon: Video, label: 'HD Video', desc: '1080p video calls' },
    { icon: Users, label: 'Up to 32', desc: 'Participants per call' },
    { icon: Monitor, label: 'Screen Share', desc: 'Share your DAW' },
    { icon: Radio, label: 'Go Live', desc: 'Stream to platforms' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-brand-primary/10 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-500/5 to-transparent blur-3xl" />
      </div>

      {/* Logo & Header Section */}
      <div className="relative z-10">
        <div className="mx-auto max-w-5xl px-4 py-8">
          {/* RR Logo - Theme Aware */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 flex flex-col items-center"
          >
            <ThemeLogo size="lg" priority />
          </motion.div>

          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <Video className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="mb-3 text-3xl font-bold md:text-4xl" style={{ color: 'var(--text)' }}>
              Video Meetings
            </h1>
            <p className="text-lg" style={{ color: 'var(--muted)' }}>
              HD video calls, screen sharing & live collaboration
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16">
        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {/* Instant Meeting */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createInstantMeeting}
            disabled={isCreating}
            className="group relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-white/[0.02] p-6 text-left transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* Gradient glow */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />
            <div className="absolute left-4 right-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 transition-all duration-300 group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Video className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-white">New Meeting</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Start an instant video call
              </p>
            </div>
          </motion.button>

          {/* Schedule Meeting */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSchedule(true)}
            className="group relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-white/[0.02] p-6 text-left transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />
            <div className="absolute left-4 right-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-pink-400 opacity-0 transition-all duration-300 group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <CalendarPlus className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-1.5 text-lg font-semibold text-white">Schedule</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Plan a meeting for later
              </p>
            </div>
          </motion.button>

          {/* Join by Code */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 transition-all duration-300 hover:border-white/20">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-10" />

            <div className="relative z-10">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                <LinkIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-white">Join Meeting</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
                  placeholder="abc-defg-hij"
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder-white/40 transition-all focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                <button
                  onClick={handleJoinByCode}
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Schedule Modal */}
        {showSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowSchedule(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-2xl"
            >
              {/* Modal header gradient line */}
              <div className="h-1 bg-gradient-to-r from-purple-500 via-brand-primary to-orange-500" />

              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                    <CalendarPlus className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Schedule Meeting</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--muted)' }}
                    >
                      Meeting Title
                    </label>
                    <input
                      type="text"
                      value={scheduleTitle}
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      placeholder="Band rehearsal, songwriting session..."
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder-white/40 transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium"
                        style={{ color: 'var(--muted)' }}
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    <div>
                      <label
                        className="mb-2 block text-sm font-medium"
                        style={{ color: 'var(--muted)' }}
                      >
                        Time
                      </label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium"
                      style={{ color: 'var(--muted)' }}
                    >
                      Duration
                    </label>
                    <select
                      value={scheduleDuration}
                      onChange={(e) => setScheduleDuration(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white transition-all focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowSchedule(false)}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition-all hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createScheduledMeeting}
                      disabled={isCreating}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 disabled:opacity-50"
                    >
                      {isCreating ? (
                        'Creating...'
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Schedule
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Success toast for scheduled meeting */}
        {copied === 'scheduled' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-white shadow-2xl shadow-green-500/30"
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Meeting scheduled! Link copied to clipboard.
            </div>
          </motion.div>
        )}

        {/* Active Meetings */}
        {activeMeetings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              <h2 className="text-xl font-bold text-white">Active Now</h2>
            </div>
            <div className="space-y-4">
              {activeMeetings.map((meeting, index) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={() => router.push(`/meet/${meeting.meetingCode}`)}
                  onCopy={() => handleCopyLink(meeting)}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <div className="mb-4 flex items-center gap-3">
              <Calendar className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-xl font-bold text-white">Upcoming</h2>
            </div>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting, index) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={() => router.push(`/meet/${meeting.meetingCode}`)}
                  onCopy={() => handleCopyLink(meeting)}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Empty State */}
        {!isLoading && meetings.length === 0 && (
          <EmptyState
            type="collaborations"
            title="No meetings yet"
            description="Start an instant meeting or schedule one for later"
            actionLabel="Start Instant Meeting"
            onAction={createInstantMeeting}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-3 text-lg"
              style={{ color: 'var(--muted)' }}
            >
              <Sparkles className="h-5 w-5" />
              Loading meetings...
            </motion.div>
          </div>
        )}

        {/* Features Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-8"
        >
          <div className="mb-6 text-center">
            <h3 className="mb-2 text-xl font-bold text-white">Built for Musicians</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Professional video collaboration for remote sessions
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-white/70" />
                </div>
                <div className="text-lg font-semibold text-white">{feature.label}</div>
                <div className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  {feature.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
