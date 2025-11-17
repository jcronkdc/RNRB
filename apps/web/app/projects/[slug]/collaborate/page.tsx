'use client';

import { useEffect, useState } from 'react';
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
  Check
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import Daily.co and Ably to prevent SSR issues
const DailyProvider = dynamic(() => import('@daily-co/daily-react').then(m => m.DailyProvider), { ssr: false });

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-surface/20 to-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  const collaborators = project.collaborators || [
    { id: user.id, email: user.email, role: 'owner', status: 'active' }
  ];
  const pendingInvites = project.invites || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <h1 className="text-4xl font-bold text-foreground mb-2">
          🕸️ Collaboration Hub
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The network nodes for <span className="text-brand-primary">{project.name}</span>
        </p>

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
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('team')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'team'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Team
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'chat'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Project Chat
          </button>
          <button
            onClick={() => setActiveView('video')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'video'
                ? 'bg-brand-primary text-brand-primary-foreground'
                : 'bg-surface text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="w-4 h-4 inline mr-2" />
            Video Room
          </button>
        </div>

        {/* Team View */}
        {activeView === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Current Team */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Network Nodes ({collaborators.length})
                </h2>
                <div className="space-y-3">
                  {collaborators.map((collab: any) => (
                    <div key={collab.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {collab.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{collab.email}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            {collab.role === 'owner' && <><Crown className="w-3 h-3 text-yellow-500" /> Owner</>}
                            {collab.role === 'admin' && <><Shield className="w-3 h-3 text-blue-500" /> Admin</>}
                            {collab.role === 'member' && <><UserIcon className="w-3 h-3" /> Member</>}
                          </p>
                        </div>
                      </div>
                    </div>
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
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-primary" />
                  Invite Collaborator
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite musicians to collaborate on this project. They'll get email access.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="musician@example.com"
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:outline-none"
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-medium mb-2">🔒 Invite-Only Access</p>
                  <p className="text-xs text-muted-foreground">
                    Only people you invite can see this project. They must accept the invitation to gain access.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Chat View */}
        {activeView === 'chat' && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Project Chat (Ably Real-Time)
            </h2>
            <div className="p-12 text-center bg-surface/50 rounded-lg border-2 border-dashed border-border">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Real-time chat integration coming soon</p>
              <p className="text-sm text-muted-foreground">
                Ably-powered messaging with @mentions, file sharing, and presence awareness
              </p>
            </div>
          </Card>
        )}

        {/* Video View */}
        {activeView === 'video' && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Video Collaboration Room (Daily.co)
            </h2>
            <div className="p-12 text-center bg-surface/50 rounded-lg border-2 border-dashed border-border">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Video room integration coming soon</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div className="p-3 bg-background rounded">
                  <p className="text-sm font-medium text-foreground mb-1">🎥 HD Video</p>
                  <p className="text-xs text-muted-foreground">Up to 32 participants</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <p className="text-sm font-medium text-foreground mb-1">🖱️ Cursor Control</p>
                  <p className="text-xs text-muted-foreground">Shared screen control</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <p className="text-sm font-medium text-foreground mb-1">💬 In-Room Chat</p>
                  <p className="text-xs text-muted-foreground">Text while collaborating</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <p className="text-sm font-medium text-foreground mb-1">🎙️ Talkback</p>
                  <p className="text-xs text-muted-foreground">Producer communication</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

