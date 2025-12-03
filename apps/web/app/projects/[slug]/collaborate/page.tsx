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
} from '@/components/ui/custom-icons';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { formatDateLong } from '@/lib/format-date';
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
          inviterName: user.name,
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-gray-900/50 to-black">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10"
          >
            <Users className="h-6 w-6 text-orange-500" />
          </motion.div>
          <div className="text-center">
            <div className="text-lg font-medium text-white">Loading collaboration hub...</div>
            <div className="mt-2 text-sm text-gray-400">Connecting your team workspace</div>
          </div>
        </div>
      </div>
    );
  }

  const collaborators = project.collaborators || [
    { id: user.id, email: user.email, role: 'owner', status: 'active' },
  ];
  const pendingInvites = project.invites || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900/50 to-black">
      {/* Improved Hero Section with Better Mobile Layout */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <Link
              href={`/projects/${slug}`}
              className="mb-4 inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-orange-500 sm:mb-6"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Back to Project</span>
            </Link>

            <div className="mb-3 flex items-center gap-3 sm:mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 sm:h-12 sm:w-12">
                <Users className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-gray-400 sm:text-sm">Collaborate on</p>
                <h1 className="truncate text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl">
                  {project.name}
                </h1>
              </div>
            </div>
            <p className="text-sm text-gray-300 sm:text-base lg:text-lg">
              Real-time chat, video collaboration, and team management in one place
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {message && (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm sm:mb-6 sm:p-4 sm:text-base ${
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
            className="mb-4 rounded-lg border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-3 sm:mb-6 sm:p-4"
          >
            <PresenceIndicator
              channelName={`project:${slug}`}
              currentUser={{
                userId: user.id,
                userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                userEmail: user.email || '',
                avatar: user.image,
              }}
              location={`project:${slug}:${activeView}`}
              showDetails={false}
              maxVisible={10}
            />
          </motion.div>
        )}

        {/* Improved Tab Navigation - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 flex gap-1 overflow-x-auto border-b border-gray-800 pb-2 sm:mb-6 sm:gap-2"
        >
          <button
            onClick={() => setActiveView('team')}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
              activeView === 'team'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Team</span>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
              activeView === 'chat'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveView('video')}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
              activeView === 'video'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <Video className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Video</span>
          </button>
          <button
            onClick={() => setActiveView('activity')}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
              activeView === 'activity'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Activity</span>
          </button>
          <button
            onClick={() => setActiveView('ai-music')}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-all sm:gap-2 sm:px-6 sm:py-3 sm:text-base ${
              activeView === 'ai-music'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>AI Music</span>
            <span className="absolute -right-0.5 -top-0.5 rounded bg-orange-500 px-1 py-0.5 text-[9px] font-bold uppercase text-white sm:-right-1 sm:-top-1 sm:px-1.5 sm:text-[10px]">
              Beta
            </span>
          </button>
        </motion.div>

        {/* Team View - Mobile Optimized */}
        {activeView === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3"
          >
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">
              {/* Current Team */}
              <Card className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white sm:mb-4 sm:text-2xl">
                  <Users className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
                  <span>Team Members ({collaborators.length})</span>
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {collaborators.map((collab: any, index: number) => (
                    <motion.div
                      key={collab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-3 transition-all hover:bg-gray-800/50 sm:p-4"
                    >
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-sm font-semibold text-white sm:h-10 sm:w-10 sm:text-base">
                          {collab.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white sm:text-base">
                            {collab.email}
                          </p>
                          <p className="flex items-center gap-1.5 text-xs text-gray-400 sm:gap-2 sm:text-sm">
                            {collab.role === 'owner' && (
                              <>
                                <Crown className="h-2.5 w-2.5 text-orange-500 sm:h-3 sm:w-3" />{' '}
                                Owner
                              </>
                            )}
                            {collab.role === 'admin' && (
                              <>
                                <Shield className="h-2.5 w-2.5 text-orange-500 sm:h-3 sm:w-3" />{' '}
                                Admin
                              </>
                            )}
                            {collab.role === 'member' && (
                              <>
                                <UserIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Member
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
                <Card className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6">
                  <h3 className="mb-3 text-lg font-semibold text-white sm:mb-4 sm:text-xl">
                    Pending Invitations ({pendingInvites.length})
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {pendingInvites.map((invite: any) => (
                      <div
                        key={invite.id}
                        className="flex flex-col gap-2 rounded-lg border border-gray-800 bg-gray-900/50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-white sm:text-base">
                            {invite.email}
                          </p>
                          <p className="text-xs text-gray-400 sm:text-sm">
                            Invited {formatDateLong(invite.invited_at)}
                          </p>
                        </div>
                        <span className="self-start rounded-full border border-yellow-500/30 bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400 sm:px-3 sm:text-sm">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Invite Panel - Mobile Optimized */}
            <div>
              <Card className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white sm:mb-4 sm:text-xl">
                  <UserPlus className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
                  <span>Invite Member</span>
                </h3>
                <p className="mb-3 text-xs text-gray-400 sm:mb-4 sm:text-sm">
                  Invite musicians to collaborate on this project
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="musician@example.com"
                    className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:px-4 sm:text-base"
                    onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 sm:text-base"
                  >
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>

                <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/50 p-3 sm:mt-6 sm:p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500/20 sm:h-5 sm:w-5">
                      <Check className="h-2.5 w-2.5 text-orange-500 sm:h-3 sm:w-3" />
                    </div>
                    <p className="text-xs font-semibold text-white sm:text-sm">
                      Invite-Only Access
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
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
          <Card className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6">
            <ProjectChat projectSlug={slug} projectName={project.name} />
          </Card>
        )}

        {/* Video View - LIVE Daily.co Integration */}
        {activeView === 'video' && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6">
              <ProjectVideoRoom projectSlug={slug} projectName={project.name} />
            </Card>

            {/* Collaborative Whiteboard */}
            {user && (
              <Card className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6">
                <h3 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-semibold text-white sm:mb-4 sm:text-xl">
                  <Palette className="h-4 w-4 shrink-0 text-orange-500 sm:h-5 sm:w-5" />
                  <span>Collaborative Whiteboard</span>
                  <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                    Live Sync
                  </span>
                </h3>
                <p className="mb-3 text-xs text-gray-400 sm:mb-4 sm:text-sm">
                  Draw chord diagrams, song structures, or brainstorm ideas together in real-time
                </p>
                <div className="overflow-x-auto">
                  <CollaborativeWhiteboard
                    channelName={`whiteboard:project:${slug}`}
                    currentUser={{
                      userId: user.id,
                      userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    }}
                    width={800}
                    height={500}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        {/* AI Music Together View - Mobile Optimized */}
        {activeView === 'ai-music' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Coming Soon Banner with R&R Labs - Mobile Responsive */}
            <Card className="rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent to-brand-primary/10 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg sm:h-16 sm:w-16">
                  <FlaskConical className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
                    <h2 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                      AI Music Together
                    </h2>
                    <span className="rounded-full border border-purple-500/40 bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-400 sm:px-3 sm:text-sm">
                      R&R Labs
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-gray-400 sm:mb-4 sm:text-base lg:text-lg">
                    Collaborative AI-assisted music creation - Generate stems together, replace with
                    human recordings, iterate infinitely
                  </p>
                  <div className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 sm:px-4">
                    <Sparkles className="h-3 w-3 shrink-0 text-orange-500 sm:h-4 sm:w-4" />
                    <span className="text-xs font-semibold text-orange-500 sm:text-sm">
                      Coming Soon - We Need Your Help!
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* R&R Labs Volunteer Section - Mobile Responsive */}
            <Card className="rounded-xl border-2 border-orange-500/20 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6 lg:p-8">
              <div className="mx-auto max-w-3xl">
                <h3 className="mb-3 flex flex-wrap items-center gap-2 text-xl font-bold text-white sm:mb-4 sm:text-2xl">
                  <FlaskConical className="h-5 w-5 shrink-0 text-purple-400 sm:h-6 sm:w-6" />
                  <span>Help Us Build the Future - R&R Labs</span>
                </h3>

                <div className="mb-4 space-y-3 text-sm text-gray-400 sm:mb-6 sm:space-y-4 sm:text-base">
                  <p className="leading-relaxed">
                    We're building our own AI music generation model specifically designed for{' '}
                    <strong className="text-white">collaborative music creation</strong>, not solo
                    AI replacement like Suno or Udio.
                  </p>

                  <p className="leading-relaxed">
                    <strong className="text-white">R&R Labs</strong> is our research division
                    focused on creating AI tools that <em>assist</em> musicians rather than replace
                    them. We need your creativity, feedback, and musical expertise to train models
                    that understand real collaborative workflows.
                  </p>

                  <div className="my-4 rounded-xl border border-gray-800 bg-gray-900/50 p-3 sm:my-6 sm:p-6">
                    <h4 className="mb-2 font-semibold text-white sm:mb-3">What We're Building:</h4>
                    <ul className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-400 sm:h-4 sm:w-4" />
                        <span>
                          <strong>Stem Generation:</strong> AI creates individual tracks (vocals,
                          drums, bass, guitar, synth)
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-400 sm:h-4 sm:w-4" />
                        <span>
                          <strong>Infinite Iteration:</strong> Regenerate any stem you don't like,
                          keep refining
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-400 sm:h-4 sm:w-4" />
                        <span>
                          <strong>Human-Over-AI:</strong> Replace any AI stem with your real
                          recording
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-400 sm:h-4 sm:w-4" />
                        <span>
                          <strong>Real-Time Collaboration:</strong> Your team sees all changes
                          instantly via Ably
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5 sm:gap-2">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-400 sm:h-4 sm:w-4" />
                        <span>
                          <strong>Defensible Copyright:</strong> Human contribution tracking for
                          legal ownership
                        </span>
                      </li>
                    </ul>
                  </div>

                  <p className="leading-relaxed">
                    <strong className="text-white">We need volunteers</strong> to help us understand
                    how musicians actually want to collaborate with AI. Your input will directly
                    shape the tools we build.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Button
                    className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-600 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
                    onClick={() =>
                      window.open(
                        'mailto:labs@rnrb.app?subject=Volunteer for R&R Labs AI Music',
                        '_blank'
                      )
                    }
                  >
                    <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Volunteer for R&R Labs
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-xl px-6 py-3 text-sm font-semibold sm:px-8 sm:py-4 sm:text-base"
                    onClick={() => window.open('https://labs.cronkwaters.com', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Learn About R&R Labs
                  </Button>
                </div>

                <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 sm:mt-6 sm:p-4">
                  <p className="flex items-start gap-2 text-xs text-gray-400 sm:text-sm">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-purple-400 sm:h-4 sm:w-4" />
                    <span>
                      <strong className="text-white">Why volunteer?</strong> Be part of building the
                      first truly collaborative AI music platform. Early access to features, direct
                      input on tools, and recognition in our research credits.
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Preview Section - Mobile Responsive */}
            <Card className="rounded-xl border-2 border-dashed border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6 lg:p-8">
              <div className="mb-4 text-center sm:mb-6">
                <h4 className="mb-1 flex flex-wrap items-center justify-center gap-2 text-lg font-semibold text-white sm:mb-2 sm:text-xl">
                  <Sparkles className="h-4 w-4 text-purple-400 sm:h-5 sm:w-5" />
                  <span>Preview: How AI Music Together Will Work</span>
                </h4>
                <p className="text-xs text-gray-400 sm:text-sm">
                  This interface is built and ready - we just need the AI model
                </p>
              </div>

              <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className="flex items-start gap-3 rounded-xl bg-gray-900/50 p-3 sm:gap-4 sm:p-4"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-500 sm:h-8 sm:w-8 sm:text-base">
                      {num}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-sm font-semibold text-white sm:text-base">
                        {num === 1 && 'Start Session'}
                        {num === 2 && 'AI Generates'}
                        {num === 3 && 'Iterate Together'}
                        {num === 4 && 'Export Final Mix'}
                      </p>
                      <p className="text-xs text-gray-400 sm:text-sm">
                        {num === 1 &&
                          'Enter creative direction: "Upbeat indie rock about summer nights"'}
                        {num === 2 &&
                          'Lyrics + 5 stems (vocals, drums, bass, guitar, synth) - all team members see instantly'}
                        {num === 3 &&
                          "Don't like the guitar? Regenerate it. Want real vocals? Upload yours. Infinite refinement."}
                        {num === 4 &&
                          'Download your AI + human hybrid track with full copyright ownership'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Activity View - Mobile Optimized */}
        {activeView === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6">
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
