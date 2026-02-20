'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Music,
  Plus,
  Video,
  Mic2,
  Users,
  TrendingUp,
  FileText,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { formatDateLong } from '@/lib/format-date';
import { useSession } from 'next-auth/react';

type Session = {
  id: string;
  type: 'recording' | 'writing' | 'rehearsal' | 'video' | 'mixing' | 'other';
  song_id?: string;
  song_title?: string;
  duration_minutes: number;
  notes: string;
  participants: string[];
  date: string;
  created_by: string;
  created_at: string;
};

export default function ProjectSessionsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth');
      return;
    }

    setUser(session.user);

    const loadData = async () => {
      try {
        const response = await fetch(`/api/projects/${slug}`);
        if (!response.ok) {
          router.push('/projects');
          return;
        }
        const projectData = await response.json();
        setProject(projectData);
        setSessions(projectData.sessions || projectData.studioSessions || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
        router.push('/projects');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, slug, session, authStatus]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <div style={{ color: 'var(--muted)' }}>Loading sessions...</div>
        </div>
      </div>
    );
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const sessionsByType = sessions.reduce(
    (acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="rnrb-container max-w-7xl">
        {/* Logo & Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="group">
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={48}
              height={48}
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <Link
              href="/projects"
              className="transition"
              style={{ color: 'var(--muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            >
              Projects
            </Link>
            <span>/</span>
            <Link
              href={`/projects/${slug}`}
              className="transition"
              style={{ color: 'var(--muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {project.name}
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--text)' }}>Sessions</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display mb-2 text-4xl font-bold" style={{ color: 'var(--text)' }}>
              Recording Sessions
            </h1>
            <p className="text-xl" style={{ color: 'var(--muted)' }}>
              Track your creative work and collaborate with your team
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
          >
            <Plus className="h-5 w-5" />
            Log Session
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card
            className="p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="mb-2 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(232, 93, 59, 0.15)' }}
              >
                <Clock className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {totalHours}h {remainingMinutes}m
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Total Time
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="mb-2 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(232, 93, 59, 0.15)' }}
              >
                <Calendar className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {sessions.length}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Total Sessions
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="mb-2 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(232, 93, 59, 0.15)' }}
              >
                <Mic2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {sessionsByType.recording || 0}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Recording Sessions
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="mb-2 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(232, 93, 59, 0.15)' }}
              >
                <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {sessionsByType.rehearsal || 0}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Rehearsals
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card
            className="p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Calendar
              className="mx-auto mb-4 h-16 w-16"
              style={{ color: 'var(--muted)', opacity: 0.5 }}
            />
            <h3 className="mb-2 text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              No sessions logged yet
            </h3>
            <p className="mx-auto mb-6 max-w-md" style={{ color: 'var(--muted)' }}>
              Start tracking your creative work. Log recording sessions, writing time, rehearsals,
              and more. Your team can see your progress.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-white"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}
            >
              <Plus className="h-6 w-6" />
              Log Your First Session
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Session History
            </h2>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  className="p-6 transition"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            session.type === 'recording'
                              ? 'bg-red-500/10'
                              : session.type === 'writing'
                                ? 'bg-purple-500/10'
                                : session.type === 'rehearsal'
                                  ? 'bg-blue-500/10'
                                  : session.type === 'video'
                                    ? 'bg-green-500/10'
                                    : session.type === 'mixing'
                                      ? 'bg-orange-500/10'
                                      : 'bg-gray-500/10'
                          }`}
                        >
                          {session.type === 'recording' && (
                            <Mic2 className="h-5 w-5 text-red-500" />
                          )}
                          {session.type === 'writing' && (
                            <FileText className="h-5 w-5 text-purple-500" />
                          )}
                          {session.type === 'rehearsal' && (
                            <Users className="h-5 w-5 text-blue-500" />
                          )}
                          {session.type === 'video' && <Video className="h-5 w-5 text-green-500" />}
                          {session.type === 'mixing' && (
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                          )}
                          {session.type === 'other' && <Music className="h-5 w-5 text-gray-500" />}
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize" style={{ color: 'var(--text)' }}>
                            {session.type} Session
                          </h3>
                          {session.song_title && (
                            <p className="text-sm" style={{ color: 'var(--muted)' }}>
                              Song: {session.song_title}
                            </p>
                          )}
                        </div>
                      </div>

                      {session.notes && (
                        <p className="ml-13 mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                          {session.notes}
                        </p>
                      )}

                      <div
                        className="ml-13 flex items-center gap-4 text-xs"
                        style={{ color: 'var(--muted)' }}
                      >
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration_minutes} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateLong(session.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {session.participants.length} participant
                          {session.participants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Helpful Note */}
        <Card
          className="mt-8 p-6"
          style={{
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          }}
        >
          <p className="mb-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
            Why Track Sessions?
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Logging your creative work helps you and your team see progress, coordinate schedules,
            and prepare for royalty split conversations. Plus, you'll never forget when that magic
            take happened!
          </p>
        </Card>
      </div>
    </div>
  );
}
