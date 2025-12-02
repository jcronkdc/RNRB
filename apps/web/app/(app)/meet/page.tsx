'use client';

import { motion } from 'framer-motion';
import {
  Video,
  Calendar,
  Link2 as LinkIcon,
  Plus,
  Clock,
  Users,
  Copy,
  Check,
  ArrowRight,
  Play,
  Settings,
  Trash2,
  ExternalLink,
  CalendarPlus,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  onDelete,
}: {
  meeting: Meeting;
  onJoin: () => void;
  onCopy: () => void;
  onDelete: () => void;
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-all ${
        isActive
          ? 'border-green-500/50 bg-green-500/10'
          : isPast
            ? 'border-white/5 bg-zinc-900/50 opacity-60'
            : 'border-white/10 bg-zinc-900/50 hover:border-purple-500/30'
      } `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {isActive && (
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Active
              </span>
            )}
            {isScheduled && scheduledTime && (
              <span className="flex items-center gap-1 text-xs text-purple-400">
                <Clock className="h-3 w-3" />
                {scheduledTime}
              </span>
            )}
          </div>

          <h3 className="truncate font-semibold text-white">{meeting.title}</h3>

          <div className="mt-2 flex items-center gap-3 text-sm text-white/50">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {meeting.participantCount}
            </span>
            <span className="font-mono text-xs">{meeting.meetingCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </button>

          {!isPast && (
            <motion.button
              onClick={onJoin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium ${
                isActive ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
              } `}
            >
              <Play className="h-4 w-4" />
              {isActive ? 'Join' : 'Start'}
            </motion.button>
          )}
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

        // Copy link to clipboard
        navigator.clipboard.writeText(data.meeting.joinUrl);
        alert(`Meeting scheduled! Link copied to clipboard:\n${data.meeting.joinUrl}`);
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
    // Clean up code (remove spaces, normalize)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* RR Logo */}
      <div className="flex justify-center pb-2 pt-6">
        <Link href="/" className="transition-transform hover:scale-105">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={80}
            height={80}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/20 p-2">
                <Video className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Meetings</h1>
                <p className="text-sm text-white/50">Video calls & collaboration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Instant Meeting */}
          <motion.button
            onClick={createInstantMeeting}
            disabled={isCreating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 text-left transition-all hover:border-purple-500/50"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500 p-2">
                <Video className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-white">New Meeting</span>
            </div>
            <p className="text-sm text-white/60">Start an instant video call with your team</p>
          </motion.button>

          {/* Schedule Meeting */}
          <motion.button
            onClick={() => setShowSchedule(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 text-left transition-all hover:border-white/20"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500 p-2">
                <CalendarPlus className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-white">Schedule</span>
            </div>
            <p className="text-sm text-white/60">Plan a meeting for later with a shareable link</p>
          </motion.button>

          {/* Join by Code */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-green-500 p-2">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-white">Join Meeting</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
                placeholder="abc-defg-hij"
                className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-green-500/50 focus:outline-none"
              />
              <button
                onClick={handleJoinByCode}
                className="rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Modal */}
        {showSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setShowSchedule(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6"
            >
              <h2 className="mb-4 text-xl font-bold text-white">Schedule Meeting</h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-white/70">Title</label>
                  <input
                    type="text"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="Team Sync"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-white/70">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-white/70">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-white/70">Duration</label>
                  <select
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSchedule(false)}
                    className="flex-1 rounded-xl bg-white/10 px-4 py-3 font-medium text-white transition-colors hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={createScheduledMeeting}
                    disabled={isCreating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-xl bg-purple-500 px-4 py-3 font-medium text-white disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Schedule & Copy Link'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Active Meetings */}
        {activeMeetings.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
              </span>
              Active Now
            </h2>
            <div className="space-y-3">
              {activeMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={() => router.push(`/meet/${meeting.meetingCode}`)}
                  onCopy={() => handleCopyLink(meeting)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Calendar className="h-5 w-5 text-purple-400" />
              Upcoming
            </h2>
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={() => router.push(`/meet/${meeting.meetingCode}`)}
                  onCopy={() => handleCopyLink(meeting)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && meetings.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Video className="h-10 w-10 text-white/30" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">No meetings yet</h2>
            <p className="mb-6 text-white/60">Start an instant meeting or schedule one for later</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
