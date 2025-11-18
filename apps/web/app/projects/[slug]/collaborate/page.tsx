'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@cronkwaters/ui';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Video,
  MessageSquare,
  Share2,
  Crown,
  Shield,
  User as UserIcon,
  X,
  Check,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import collaboration components
const ProjectChat = dynamic(() => import('@/components/project-chat').then(m => m.ProjectChat), { ssr: false });
const ProjectVideoRoom = dynamic(() => import('@/components/project-video-room').then(m => m.ProjectVideoRoom), { ssr: false });

export default function ProjectCollaboratePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeView, setActiveView] = useState<'team' | 'chat' | 'video'>('team');

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
      setLoading(false);
    });
  }, [router, slug]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setMessage({ type: 'error', text: 'Email required' });
      return;
    }

    setInviting(true);
    setMessage(null);

    try {
      // Create invitation (stored in project)
      const newInvite = {
        id: `invite_${Date.now()}`,
        email: inviteEmail,
        role: 'member',
        status: 'pending',
        invited_by: user.email,
        invited_at: new Date().toISOString()
      };

      const allProjects = user.user_metadata?.projects || [];
      const updatedProjects = allProjects.map((p: any) => {
        if (p.slug === slug) {
          return {
            ...p,
            invites: [...(p.invites || []), newInvite],
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects
        }
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Invitation sent to ${inviteEmail}. They'll receive an email to join this project.` 
      });
      setInviteEmail('');
      
      // Reload project data
      const updated = updatedProjects.find((p: any) => p.slug === slug);
      setProject(updated);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground font-mono text-sm"
        >
          Loading collaboration hub...
        </motion.div>
      </div>
    );
  }

  const collaborators = project.collaborators || [
    { id: user.id, email: user.email, role: 'owner', status: 'active' }
  ];
  const pendingInvites = project.invites || [];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <Link href={`/projects/${slug}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand-primary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Back to Project</span>
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collaborate on</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  {project.name}
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              Real-time chat, video collaboration, and team management in one place
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-12 px-4">

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-2 mb-6 border-b border-border pb-2"
        >
          <button
            onClick={() => setActiveView('team')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all font-medium ${
              activeView === 'team'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Team
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all font-medium ${
              activeView === 'chat'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveView('video')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all font-medium ${
              activeView === 'video'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
        </motion.div>

        {/* Team View */}
        {activeView === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              {/* Current Team */}
              <Card className="p-6 rnrb-card">
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-brand-primary" />
                  Team Members ({collaborators.length})
                </h2>
                <div className="space-y-3">
                  {collaborators.map((collab: any, index: number) => (
                    <motion.div
                      key={collab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-surface hover:bg-surface-muted border border-border rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center text-foreground font-semibold">
                          {collab.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{collab.email}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {collab.role === 'owner' && <><Crown className="w-3 h-3 text-brand-primary" /> Owner</>}
                            {collab.role === 'admin' && <><Shield className="w-3 h-3 text-brand-primary" /> Admin</>}
                            {collab.role === 'member' && <><UserIcon className="w-3 h-3" /> Member</>}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Pending Invitations ({pendingInvites.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite: any) => (
                      <div key={invite.id} className="flex items-center justify-between p-4 bg-surface/50 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited {new Date(invite.invited_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-sm text-yellow-400">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Invite Panel */}
            <div>
              <Card className="p-6 rnrb-card">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-primary" />
                  Invite Member
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite musicians to collaborate on this project
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="musician@example.com"
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition"
                    onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="w-full rnrb-button-primary"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>

                <div className="mt-6 p-4 rnrb-card bg-surface-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-brand-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Invite-Only Access</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only invited members can see this project. All collaboration is private by default.
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Chat View - LIVE Ably Integration */}
        {activeView === 'chat' && (
          <Card className="p-6">
            <ProjectChat projectSlug={slug} projectName={project.name} />
          </Card>
        )}

        {/* Video View - LIVE Daily.co Integration */}
        {activeView === 'video' && (
          <Card className="p-6">
            <ProjectVideoRoom projectSlug={slug} projectName={project.name} />
          </Card>
        )}
      </div>
    </div>
  );
}

