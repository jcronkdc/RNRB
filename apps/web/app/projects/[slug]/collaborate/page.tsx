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
  ArrowLeft,
  Sparkles,
  FlaskConical,
  ExternalLink,
  Palette
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import collaboration components
const ProjectChat = dynamic(() => import('@/components/project-chat').then(m => m.ProjectChat), { ssr: false });
const ProjectVideoRoom = dynamic(() => import('@/components/project-video-room').then(m => m.ProjectVideoRoom), { ssr: false });
const PresenceIndicator = dynamic(() => import('@/components/presence-indicator').then(m => m.PresenceIndicator), { ssr: false });
const ActivityFeed = dynamic(() => import('@/components/activity-feed').then(m => m.ActivityFeed), { ssr: false });
const CollaborativeWhiteboard = dynamic(() => import('@/components/collaborative-whiteboard').then(m => m.CollaborativeWhiteboard), { ssr: false });
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
  const [activeView, setActiveView] = useState<'team' | 'chat' | 'video' | 'ai-music' | 'activity'>('team');

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
          inviterEmail: user.email
        })
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
        invite_link: data.inviteLink
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

      // Show success with invite link
      const linkMessage = data.emailSent 
        ? `Invitation email sent to ${inviteEmail}!`
        : `Invitation created! Email not sent (EMAIL_SERVER_URL not configured). Share this link: ${data.inviteLink}`;
      
      setMessage({ 
        type: 'success', 
        text: linkMessage
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

        {/* Real-time Presence Indicator */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg"
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
          <button
            onClick={() => setActiveView('activity')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all font-medium ${
              activeView === 'activity'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Activity
          </button>
          <button
            onClick={() => setActiveView('ai-music')}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition-all font-medium relative ${
              activeView === 'ai-music'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Music Together
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-brand-primary text-white text-[10px] font-bold rounded uppercase">
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
          <div className="space-y-6">
            <Card className="p-6">
              <ProjectVideoRoom projectSlug={slug} projectName={project.name} />
            </Card>

            {/* Collaborative Whiteboard */}
            {user && (
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-brand-primary" />
                  Collaborative Whiteboard
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    Live Sync
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
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
            <Card className="p-8 rnrb-card bg-gradient-to-br from-purple-500/10 via-transparent to-brand-primary/10 border-2 border-purple-500/30">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <FlaskConical className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-display font-bold text-foreground">AI Music Together</h2>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm font-bold text-purple-400">
                      R&R Labs
                    </span>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">
                    Collaborative AI-assisted music creation - Generate stems together, replace with human recordings, iterate infinitely
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-brand-primary" />
                    <span className="text-sm font-semibold text-brand-primary">Coming Soon - We Need Your Help!</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* R&R Labs Volunteer Section */}
            <Card className="p-8 rnrb-card border-2 border-brand-primary/20">
              <div className="max-w-3xl">
                <h3 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
                  <FlaskConical className="w-6 h-6 text-purple-400" />
                  Help Us Build the Future - R&R Labs
                </h3>
                
                <div className="space-y-4 text-muted-foreground mb-6">
                  <p className="text-base leading-relaxed">
                    We're building our own AI music generation model specifically designed for <strong className="text-foreground">collaborative music creation</strong>, 
                    not solo AI replacement like Suno or Udio.
                  </p>
                  
                  <p className="text-base leading-relaxed">
                    <strong className="text-foreground">R&R Labs</strong> is our research division focused on creating AI tools that <em>assist</em> musicians 
                    rather than replace them. We need your creativity, feedback, and musical expertise to train models that understand 
                    real collaborative workflows.
                  </p>

                  <div className="bg-surface-muted border border-border rounded-xl p-6 my-6">
                    <h4 className="font-semibold text-foreground mb-3">What We're Building:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Stem Generation:</strong> AI creates individual tracks (vocals, drums, bass, guitar, synth)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Infinite Iteration:</strong> Regenerate any stem you don't like, keep refining</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Human-Over-AI:</strong> Replace any AI stem with your real recording</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Real-Time Collaboration:</strong> Your team sees all changes instantly via Ably</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span><strong>Defensible Copyright:</strong> Human contribution tracking for legal ownership</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-base leading-relaxed">
                    <strong className="text-foreground">We need volunteers</strong> to help us understand how musicians actually want to collaborate 
                    with AI. Your input will directly shape the tools we build.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    onClick={() => window.open('mailto:labs@cronkwaters.com?subject=Volunteer for R&R Labs AI Music', '_blank')}
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Volunteer for R&R Labs
                  </Button>
                  <Button 
                    variant="secondary"
                    className="px-8 py-4 rounded-xl font-semibold"
                    onClick={() => window.open('https://labs.cronkwaters.com', '_blank')}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Learn About R&R Labs
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">Why volunteer?</strong> Be part of building the first truly collaborative 
                      AI music platform. Early access to features, direct input on tools, and recognition in our research credits.
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Preview: What the Interface Will Look Like */}
            <Card className="p-8 rnrb-card border-2 border-dashed border-border">
              <div className="text-center mb-6">
                <h4 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Preview: How AI Music Together Will Work
                </h4>
                <p className="text-sm text-muted-foreground">This interface is built and ready - we just need the AI model</p>
              </div>
              
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex items-start gap-4 p-4 bg-surface-muted rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Start Session</p>
                    <p className="text-sm text-muted-foreground">Enter creative direction: "Upbeat indie rock about summer nights"</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-surface-muted rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">AI Generates</p>
                    <p className="text-sm text-muted-foreground">Lyrics + 5 stems (vocals, drums, bass, guitar, synth) - all team members see instantly</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-surface-muted rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Iterate Together</p>
                    <p className="text-sm text-muted-foreground">Don't like the guitar? Regenerate it. Want real vocals? Upload yours. Infinite refinement.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-surface-muted rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Export Final Mix</p>
                    <p className="text-sm text-muted-foreground">Download your AI + human hybrid track with full copyright ownership</p>
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
            <Card className="p-6 rnrb-card">
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

