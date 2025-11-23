'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
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
} from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    supabase?.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setUser(user);
      const projects = user.user_metadata?.projects || [];
      const foundProject = projects.find((p: any) => p.slug === slug);

      if (!foundProject) {
        router.push('/projects');
        return;
      }

      setProject(foundProject);
      setSessions(foundProject.sessions || []);
      setLoading(false);
    });
  }, [router, slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg">Loading sessions...</div>
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
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="rnrb-container max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="transition hover:text-brand-primary">
            Projects
          </Link>
          <span>/</span>
          <Link href={`/projects/${slug}`} className="transition hover:text-brand-primary">
            {project.name}
          </Link>
          <span>/</span>
          <span className="text-foreground">Sessions</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display mb-2 text-4xl font-bold">Recording Sessions</h1>
            <p className="text-xl text-muted-foreground">
              Track your creative work and collaborate with your team
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="rnrb-button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Log Session
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="rnrb-card p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                <Clock className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalHours}h {remainingMinutes}m
                </p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
          </Card>

          <Card className="rnrb-card p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                <Calendar className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="rnrb-card p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                <Mic2 className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessionsByType.recording || 0}</p>
                <p className="text-xs text-muted-foreground">Recording Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="rnrb-card p-6">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                <Users className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessionsByType.rehearsal || 0}</p>
                <p className="text-xs text-muted-foreground">Rehearsals</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card className="rnrb-card p-16 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-2xl font-semibold">No sessions logged yet</h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              Start tracking your creative work. Log recording sessions, writing time, rehearsals,
              and more. Your team can see your progress.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="rnrb-button-primary inline-flex items-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold"
            >
              <Plus className="h-6 w-6" />
              Log Your First Session
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold">Session History</h2>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="rnrb-card p-6 transition hover:border-brand-primary/30">
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
                          <h3 className="font-semibold capitalize text-foreground">
                            {session.type} Session
                          </h3>
                          {session.song_title && (
                            <p className="text-sm text-muted-foreground">
                              Song: {session.song_title}
                            </p>
                          )}
                        </div>
                      </div>

                      {session.notes && (
                        <p className="ml-13 mb-3 text-sm text-muted-foreground">{session.notes}</p>
                      )}

                      <div className="ml-13 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration_minutes} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.date).toLocaleDateString()}
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
        <Card className="rnrb-card mt-8 border-purple-500/20 bg-purple-500/5 p-6">
          <p className="mb-1 text-sm font-medium text-brand-primary">💡 Why Track Sessions?</p>
          <p className="text-xs text-muted-foreground">
            Logging your creative work helps you and your team see progress, coordinate schedules,
            and prepare for royalty split conversations. Plus, you'll never forget when that magic
            take happened!
          </p>
        </Card>
      </div>
    </div>
  );
}
