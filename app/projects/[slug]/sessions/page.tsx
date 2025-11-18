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
  FileText
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading sessions...</div>
      </div>
    );
  }

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const sessionsByType = sessions.reduce((acc, session) => {
    acc[session.type] = (acc[session.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="rnrb-container max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/projects" className="hover:text-brand-primary transition">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${slug}`} className="hover:text-brand-primary transition">{project.name}</Link>
          <span>/</span>
          <span className="text-foreground">Sessions</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Recording Sessions</h1>
            <p className="text-xl text-muted-foreground">
              Track your creative work and collaborate with your team
            </p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="rnrb-button-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log Session
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 rnrb-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalHours}h {remainingMinutes}m</p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rnrb-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rnrb-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessionsByType.recording || 0}</p>
                <p className="text-xs text-muted-foreground">Recording Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 rnrb-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-brand-primary" />
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
          <Card className="p-16 text-center rnrb-card">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-2xl font-semibold mb-2">No sessions logged yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start tracking your creative work. Log recording sessions, writing time, rehearsals, and more.
              Your team can see your progress.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="rnrb-button-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3"
            >
              <Plus className="w-6 h-6" />
              Log Your First Session
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold">Session History</h2>
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 rnrb-card hover:border-brand-primary/30 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.type === 'recording' ? 'bg-red-500/10' :
                          session.type === 'writing' ? 'bg-purple-500/10' :
                          session.type === 'rehearsal' ? 'bg-blue-500/10' :
                          session.type === 'video' ? 'bg-green-500/10' :
                          session.type === 'mixing' ? 'bg-orange-500/10' :
                          'bg-gray-500/10'
                        }`}>
                          {session.type === 'recording' && <Mic2 className="w-5 h-5 text-red-500" />}
                          {session.type === 'writing' && <FileText className="w-5 h-5 text-purple-500" />}
                          {session.type === 'rehearsal' && <Users className="w-5 h-5 text-blue-500" />}
                          {session.type === 'video' && <Video className="w-5 h-5 text-green-500" />}
                          {session.type === 'mixing' && <TrendingUp className="w-5 h-5 text-orange-500" />}
                          {session.type === 'other' && <Music className="w-5 h-5 text-gray-500" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground capitalize">{session.type} Session</h3>
                          {session.song_title && (
                            <p className="text-sm text-muted-foreground">Song: {session.song_title}</p>
                          )}
                        </div>
                      </div>
                      
                      {session.notes && (
                        <p className="text-sm text-muted-foreground mb-3 ml-13">{session.notes}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground ml-13">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.duration_minutes} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
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
        <Card className="p-6 rnrb-card bg-purple-500/5 border-purple-500/20 mt-8">
          <p className="text-sm text-brand-primary font-medium mb-1">💡 Why Track Sessions?</p>
          <p className="text-xs text-muted-foreground">
            Logging your creative work helps you and your team see progress, coordinate schedules, and prepare for royalty split conversations. 
            Plus, you'll never forget when that magic take happened!
          </p>
        </Card>
      </div>
    </div>
  );
}

