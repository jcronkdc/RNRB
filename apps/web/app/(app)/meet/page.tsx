'use client';

import { motion } from 'framer-motion';
import {
  Video,
  Calendar,
  Link2 as LinkIcon,
  Clock,
  Users,
  Copy,
  Play,
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
      className={`border bg-zinc-900/50 p-4 transition-all ${
        isActive
          ? 'border-green-500/30'
          : isPast
            ? 'border-zinc-800/30 opacity-60'
            : 'border-zinc-800 hover:border-zinc-700'
      } `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            {isActive && (
              <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-green-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                Active
              </span>
            )}
            {isScheduled && scheduledTime && (
              <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-zinc-400">
                <Clock className="h-3 w-3" />
                {scheduledTime}
              </span>
            )}
          </div>

          <h3 className="truncate text-lg font-semibold text-white">{meeting.title}</h3>

          <div className="mt-3 flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {meeting.participantCount}
            </span>
            <span className="text-zinc-600">{meeting.meetingCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </button>

          {!isPast && (
            <button
              onClick={onJoin}
              className={`border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                isActive
                  ? 'border-green-500/30 bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  : 'border-blue-500/30 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
              } `}
            >
              {isActive ? 'Join' : 'Start'}
            </button>
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
    <div className="min-h-screen bg-zinc-950">
      {/* RR Logo - WHITE logo for dark background */}
      <div className="flex justify-center border-b border-zinc-800 py-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image
            src="/logo-dark.png"
            alt="Rock N' Roll Basement"
            width={60}
            height={60}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/50">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="border border-zinc-800 bg-zinc-900 p-3">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-mono text-2xl uppercase tracking-wider text-white">Meetings</h1>
              <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-zinc-500">
                Video calls & collaboration
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Quick Actions */}
        <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Instant Meeting */}
          <button
            onClick={createInstantMeeting}
            disabled={isCreating}
            className="group border border-blue-500/30 bg-blue-500/5 p-6 text-left transition-colors hover:border-blue-500/50 hover:bg-blue-500/10"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="border border-blue-500/30 bg-blue-500/10 p-2">
                <Video className="h-5 w-5 text-blue-500" />
              </div>
              <span className="font-mono text-sm uppercase tracking-wider text-white">
                New Meeting
              </span>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Start instant video call
            </p>
          </button>

          {/* Schedule Meeting */}
          <button
            onClick={() => setShowSchedule(true)}
            className="group border border-zinc-800 bg-zinc-900/50 p-6 text-left transition-colors hover:border-zinc-700"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="border border-zinc-800 bg-zinc-900 p-2">
                <CalendarPlus className="h-5 w-5 text-white" />
              </div>
              <span className="font-mono text-sm uppercase tracking-wider text-white">
                Schedule
              </span>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              Plan meeting for later
            </p>
          </button>

          {/* Join by Code */}
          <div className="border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="border border-zinc-800 bg-zinc-900 p-2">
                <LinkIcon className="h-5 w-5 text-white" />
              </div>
              <span className="font-mono text-sm uppercase tracking-wider text-white">
                Join Meeting
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinByCode()}
                placeholder="abc-defg-hij"
                className="flex-1 border border-zinc-800 bg-black/50 px-3 py-2 font-mono text-xs uppercase tracking-wider text-white placeholder-zinc-600 focus:border-zinc-700 focus:outline-none"
              />
              <button
                onClick={handleJoinByCode}
                className="border border-green-500/30 bg-green-500/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-green-500 transition-colors hover:bg-green-500/20"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowSchedule(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md border border-zinc-800 bg-zinc-900 p-6"
            >
              <h2 className="mb-6 font-mono text-xl uppercase tracking-wider text-white">
                Schedule Meeting
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-zinc-400">
                    Title
                  </label>
                  <input
                    type="text"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="Team Sync"
                    className="w-full border border-zinc-800 bg-black/50 px-4 py-3 text-white placeholder-zinc-600 focus:border-zinc-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-zinc-400">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-zinc-800 bg-black/50 px-4 py-3 text-white focus:border-zinc-700 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-zinc-400">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full border border-zinc-800 bg-black/50 px-4 py-3 text-white focus:border-zinc-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-zinc-400">
                    Duration
                  </label>
                  <select
                    value={scheduleDuration}
                    onChange={(e) => setScheduleDuration(e.target.value)}
                    className="w-full border border-zinc-800 bg-black/50 px-4 py-3 text-white focus:border-zinc-700 focus:outline-none"
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
                    className="flex-1 border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:border-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createScheduledMeeting}
                    disabled={isCreating}
                    className="flex-1 border border-blue-500/30 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-blue-500 transition-colors hover:bg-blue-500/20 disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Schedule & Copy Link'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Active Meetings */}
        {activeMeetings.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-3 border-b border-zinc-800 pb-3 font-mono text-sm uppercase tracking-wider text-white">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
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
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-3 border-b border-zinc-800 pb-3 font-mono text-sm uppercase tracking-wider text-white">
              <Calendar className="h-4 w-4" />
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
          <div className="border border-zinc-800 bg-zinc-900/30 py-16 text-center">
            <div className="mx-auto mb-6 inline-flex border border-zinc-800 bg-zinc-900 p-4">
              <Video className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="mb-1 font-mono text-sm uppercase tracking-wider text-zinc-400">
              No meetings yet
            </p>
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-600">
              Start an instant meeting or schedule one for later
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-mono text-xs uppercase tracking-wider text-zinc-400"
            >
              Loading meetings
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
