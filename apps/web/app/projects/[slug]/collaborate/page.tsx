'use client';

import { Card, Button } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
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
  Check,
  ArrowLeft,
  Sparkles,
  FlaskConical,
  ExternalLink,
  Palette,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

// Dynamically import collaboration components
const ProjectChat = dynamic(() => import('@/components/project-chat').then((m) => m.ProjectChat), {
  ssr: false,
});
const ProjectVideoRoom = dynamic(
  () => import('@/components/project-video-room').then((m) => m.ProjectVideoRoom),
  { ssr: false }
);
const PresenceIndicator = dynamic(
  () => import('@/components/presence-indicator').then((m) => m.PresenceIndicator),
  { ssr: false }
);
const ActivityFeed = dynamic(
  () => import('@/components/activity-feed').then((m) => m.ActivityFeed),
  { ssr: false }
);
const CollaborativeWhiteboard = dynamic(
  () => import('@/components/collaborative-whiteboard').then((m) => m.CollaborativeWhiteboard),
  { ssr: false }
);
// AI Music component exists but we're showing Coming Soon with R&R Labs volunteer call
// const CollaborativeAIMusic = dynamic(() => import('@/components/collaborative-ai-music').then(m => m.CollaborativeAIMusic), { ssr: false });

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
  const [activeView, setActiveView] = useState<'team' | 'chat' | 'video' | 'ai-music' | 'activity'>(
    'team'
  );

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
      // Call API to send invitation email
      const response = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteEmail,
          projectName: project.name,
          projectSlug: slug,
          inviterName: user.user_metadata?.name,
          inviterEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      // Store invitation in project metadata
      const newInvite = {
        id: `invite_${Date.now()}`,
        email: inviteEmail,
        role: 'member',
        status: 'pending',
        invited_by: user.email,
        invited_at: new Date().toISOString(),
        invite_link: data.inviteLink,
      };

      const allProjects = user.user_metadata?.projects || [];
      const updatedProjects = allProjects.map((p: any) => {
        if (p.slug === slug) {
          return {
            ...p,
            invites: [...(p.invites || []), newInvite],
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      });

      const { error } = await supabase!.auth.updateUser({
        data: {
          ...user.user_metadata,
          projects: updatedProjects,
        },
      });

      if (error) throw error;

      // Show success with invite link
      const linkMessage = data.emailSent
        ? `Invitation email sent to ${inviteEmail}!`
        : `Invitation created! Email not sent (EMAIL_SERVER_URL not configured). Share this link: ${data.inviteLink}`;

      setMessage({
        type: 'success',
        text: linkMessage,
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
      <div className="bg-background flex min-h-screen items-center justify-center">
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
    { id: user.id, email: user.email, role: 'owner', status: 'active' },
  ];
  const pendingInvites = project.invites || [];

  return (
    <div className="bg-background min-h-screen">
      {/* Premium Hero Section */}
      <div className="border-border/50 relative overflow-hidden border-b">
        <div className="from-brand-primary/5 to-brand-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0">
          <div className="bg-brand-primary/10 absolute right-1/4 top-0 h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-brand-primary/5 absolute bottom-0 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto max-w-6xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <Link
              href={`/projects/${slug}`}
              className="text-muted-foreground hover:text-brand-primary mb-6 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Back to Project</span>
            </Link>

            <div className="mb-4 flex items-center gap-3">
              <div className="bg-brand-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
                <Users className="text-brand-primary h-6 w-6" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Collaborate on</p>
                <h1 className="font-display text-foreground text-3xl font-bold md:text-4xl">
                  {project.name}
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground text-lg">
              Real-time chat, video collaboration, and team management in one place
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        {message && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              message.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-green-400'
                : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Real-time Presence Indicator */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4"
          >
            <PresenceIndicator
              channelName={`project:${slug}`}
              currentUser={{
                userId: user.id,
                userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                userEmail: user.email || '',
                avatar: user.user_metadata?.avatar_url,
              }}
              location={`project:${slug}:${activeView}`}
              showDetails={false}
              maxVisible={10}
            />
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-border mb-6 flex gap-2 border-b pb-2"
        >
          <button
            onClick={() => setActiveView('team')}
            className={`flex items-center gap-2 rounded-t-lg px-6 py-3 font-medium transition-all ${
              activeView === 'team'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            Team
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`flex items-center gap-2 rounded-t-lg px-6 py-3 font-medium transition-all ${
              activeView === 'chat'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveView('video')}
            className={`flex items-center gap-2 rounded-t-lg px-6 py-3 font-medium transition-all ${
              activeView === 'video'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <Video className="h-4 w-4" />
            Video
          </button>
          <button
            onClick={() => setActiveView('activity')}
            className={`flex items-center gap-2 rounded-t-lg px-6 py-3 font-medium transition-all ${
              activeView === 'activity'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <Share2 className="h-4 w-4" />
            Activity
          </button>
          <button
            onClick={() => setActiveView('ai-music')}
            className={`relative flex items-center gap-2 rounded-t-lg px-6 py-3 font-medium transition-all ${
              activeView === 'ai-music'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            AI Music Together
            <span className="bg-brand-primary absolute -right-1 -top-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
              Beta
            </span>
          </button>
        </motion.div>

        {/* Team View */}
        {activeView === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <div className="space-y-6 lg:col-span-2">
              {/* Current Team */}
              <Card className="rnrb-card p-6">
                <h2 className="text-foreground mb-4 flex items-center gap-2 text-2xl font-semibold">
                  <Users className="text-brand-primary h-6 w-6" />
                  Team Members ({collaborators.length})
                </h2>
                <div className="space-y-3">
                  {collaborators.map((collab: any, index: number) => (
                    <motion.div
                      key={collab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-border bg-surface hover:bg-surface-muted flex items-center justify-between rounded-xl border p-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-primary/20 text-foreground flex h-10 w-10 items-center justify-center rounded-full font-semibold">
                          {collab.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{collab.email}</p>
                          <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            {collab.role === 'owner' && (
                              <>
                                <Crown className="text-brand-primary h-3 w-3" /> Owner
                              </>
                            )}
                            {collab.role === 'admin' && (
                              <>
                                <Shield className="text-brand-primary h-3 w-3" /> Admin
                              </>
                            )}
                            {collab.role === 'member' && (
                              <>
                                <UserIcon className="h-3 w-3" /> Member
                              </>
                            )}
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
                  <h3 className="text-foreground mb-4 text-xl font-semibold">
                    Pending Invitations ({pendingInvites.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite: any) => (
                      <div
                        key={invite.id}
                        className="border-border bg-surface/50 flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="text-foreground font-medium">{invite.email}</p>
                          <p className="text-muted-foreground text-sm">
                            Invited {new Date(invite.invited_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="rounded-full border border-yellow-500/30 bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400">
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
              <Card className="rnrb-card p-6">
                <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
                  <UserPlus className="text-brand-primary h-5 w-5" />
                  Invite Member
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Invite musicians to collaborate on this project
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="musician@example.com"
                    className="border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border px-4 py-2 outline-none transition focus:ring-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="rnrb-button-primary w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>

                <div className="rnrb-card border-border bg-surface-muted/50 mt-6 border p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="bg-brand-primary/20 flex h-5 w-5 items-center justify-center rounded-full">
                      <Check className="text-brand-primary h-3 w-3" />
                    </div>
                    <p className="text-foreground text-sm font-semibold">Invite-Only Access</p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Only invited members can see this project. All collaboration is private by
                    default.
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
          <div className="space-y-6">
            <Card className="p-6">
              <ProjectVideoRoom projectSlug={slug} projectName={project.name} />
            </Card>

            {/* Collaborative Whiteboard */}
            {user && (
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <Palette className="text-brand-primary h-5 w-5" />
                  Collaborative Whiteboard
                  <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                    Live Sync
                  </span>
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Draw chord diagrams, song structures, or brainstorm ideas together in real-time
                </p>
                <CollaborativeWhiteboard
                  channelName={`whiteboard:project:${slug}`}
                  currentUser={{
                    userId: user.id,
                    userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                  }}
                  width={800}
                  height={500}
                />
              </Card>
            )}
          </div>
        )}

        {/* AI Music Together View - HONEST "Coming Soon" with R&R Labs */}
        {activeView === 'ai-music' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Coming Soon Banner with R&R Labs */}
            <Card className="rnrb-card to-brand-primary/10 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent p-8">
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <FlaskConical className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <h2 className="font-display text-foreground text-3xl font-bold">
                      AI Music Together
                    </h2>
                    <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-3 py-1 text-sm font-bold text-purple-400">
                      R&R Labs
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-4 text-lg">
                    Collaborative AI-assisted music creation - Generate stems together, replace with
                    human recordings, iterate infinitely
                  </p>
                  <div className="border-brand-primary/30 bg-brand-primary/10 inline-flex items-center gap-2 rounded-lg border px-4 py-2">
                    <Sparkles className="text-brand-primary h-4 w-4" />
                    <span className="text-brand-primary text-sm font-semibold">
                      Coming Soon - We Need Your Help!
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* R&R Labs Volunteer Section */}
            <Card className="rnrb-card border-brand-primary/20 border-2 p-8">
              <div className="max-w-3xl">
                <h3 className="font-display mb-4 flex items-center gap-2 text-2xl font-bold">
                  <FlaskConical className="h-6 w-6 text-purple-400" />
                  Help Us Build the Future - R&R Labs
                </h3>

                <div className="text-muted-foreground mb-6 space-y-4">
                  <p className="text-base leading-relaxed">
                    We're building our own AI music generation model specifically designed for{' '}
                    <strong className="text-foreground">collaborative music creation</strong>, not
                    solo AI replacement like Suno or Udio.
                  </p>

                  <p className="text-base leading-relaxed">
                    <strong className="text-foreground">R&R Labs</strong> is our research division
                    focused on creating AI tools that <em>assist</em> musicians rather than replace
                    them. We need your creativity, feedback, and musical expertise to train models
                    that understand real collaborative workflows.
                  </p>

                  <div className="border-border bg-surface-muted my-6 rounded-xl border p-6">
                    <h4 className="text-foreground mb-3 font-semibold">What We're Building:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        <span>
                          <strong>Stem Generation:</strong> AI creates individual tracks (vocals,
                          drums, bass, guitar, synth)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        <span>
                          <strong>Infinite Iteration:</strong> Regenerate any stem you don't like,
                          keep refining
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        <span>
                          <strong>Human-Over-AI:</strong> Replace any AI stem with your real
                          recording
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        <span>
                          <strong>Real-Time Collaboration:</strong> Your team sees all changes
                          instantly via Ably
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        <span>
                          <strong>Defensible Copyright:</strong> Human contribution tracking for
                          legal ownership
                        </span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-base leading-relaxed">
                    <strong className="text-foreground">We need volunteers</strong> to help us
                    understand how musicians actually want to collaborate with AI. Your input will
                    directly shape the tools we build.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-xl"
                    onClick={() =>
                      window.open(
                        'mailto:labs@cronkwaters.com?subject=Volunteer for R&R Labs AI Music',
                        '_blank'
                      )
                    }
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Volunteer for R&R Labs
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-xl px-8 py-4 font-semibold"
                    onClick={() => window.open('https://labs.cronkwaters.com', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Learn About R&R Labs
                  </Button>
                </div>

                <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                  <p className="text-muted-foreground flex items-start gap-2 text-sm">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400" />
                    <span>
                      <strong className="text-foreground">Why volunteer?</strong> Be part of
                      building the first truly collaborative AI music platform. Early access to
                      features, direct input on tools, and recognition in our research credits.
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Preview: What the Interface Will Look Like */}
            <Card className="rnrb-card border-border border-2 border-dashed p-8">
              <div className="mb-6 text-center">
                <h4 className="mb-2 flex items-center justify-center gap-2 text-xl font-semibold">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Preview: How AI Music Together Will Work
                </h4>
                <p className="text-muted-foreground text-sm">
                  This interface is built and ready - we just need the AI model
                </p>
              </div>

              <div className="mx-auto max-w-2xl space-y-4">
                <div className="bg-surface-muted flex items-start gap-4 rounded-xl p-4">
                  <div className="bg-brand-primary/20 text-brand-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-foreground mb-1 font-semibold">Start Session</p>
                    <p className="text-muted-foreground text-sm">
                      Enter creative direction: "Upbeat indie rock about summer nights"
                    </p>
                  </div>
                </div>

                <div className="bg-surface-muted flex items-start gap-4 rounded-xl p-4">
                  <div className="bg-brand-primary/20 text-brand-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-foreground mb-1 font-semibold">AI Generates</p>
                    <p className="text-muted-foreground text-sm">
                      Lyrics + 5 stems (vocals, drums, bass, guitar, synth) - all team members see
                      instantly
                    </p>
                  </div>
                </div>

                <div className="bg-surface-muted flex items-start gap-4 rounded-xl p-4">
                  <div className="bg-brand-primary/20 text-brand-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-foreground mb-1 font-semibold">Iterate Together</p>
                    <p className="text-muted-foreground text-sm">
                      Don't like the guitar? Regenerate it. Want real vocals? Upload yours. Infinite
                      refinement.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-muted flex items-start gap-4 rounded-xl p-4">
                  <div className="bg-brand-primary/20 text-brand-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-foreground mb-1 font-semibold">Export Final Mix</p>
                    <p className="text-muted-foreground text-sm">
                      Download your AI + human hybrid track with full copyright ownership
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Activity View */}
        {activeView === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="rnrb-card p-6">
              <ActivityFeed
                channelName={`activity:project:${slug}`}
                showHeader={true}
                maxHeight="700px"
              />
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
