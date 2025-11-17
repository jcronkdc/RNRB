'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, UserPlus, Shield, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, Button } from '@cronkwaters/ui';

// Optimal pathway: Project Detail → Members (1 click)

export default function ProjectMembersPage({ params }: { params: { slug: string } }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);

  // Mock data - will be replaced with tRPC
  const members = [
    {
      id: '1',
      user: { name: 'You', email: 'you@example.com', image: null },
      role: 'owner',
      joinedAt: new Date(),
    },
  ];

  const pendingInvitations = [
    // Will show pending invites here
  ];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: tRPC mutation to create invitation
      // await trpc.project.inviteMember.mutate({
      //   projectSlug: params.slug,
      //   email: inviteEmail,
      //   role: inviteRole
      // });
      
      alert(`Invitation sent to ${inviteEmail} with role: ${inviteRole}`);
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-primary" />
            Project Members
          </h1>
          <p className="text-muted-foreground">
            Invite-only collaboration. Manage who can access and contribute to this project.
          </p>
        </div>

        {/* Invite Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Collaborator
          </h2>
          
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="collaborator@example.com"
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="viewer">Viewer - Read-only access</option>
                <option value="member">Member - Can edit songs, participate in sessions</option>
                <option value="admin">Admin - Can invite members, manage settings</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </form>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📧 An email invitation will be sent with a secure link. 
              The recipient can accept or decline. Invitations expire after 7 days.
            </p>
          </div>
        </Card>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Invitations ({pendingInvitations.length})
            </h2>
            
            <div className="space-y-3">
              {/* Will show pending invitations */}
            </div>
          </Card>
        )}

        {/* Current Members */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current Members ({members.length})
          </h2>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    {member.user.image ? (
                      <img src={member.user.image} alt={member.user.name || ''} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-brand-primary font-semibold">
                        {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-medium">{member.user.name || 'Unnamed'}</p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium">
                    {member.role === 'owner' && <Shield className="w-4 h-4" />}
                    {member.role === 'admin' && <Edit className="w-4 h-4" />}
                    {member.role === 'member' && <Users className="w-4 h-4" />}
                    {member.role === 'viewer' && <Eye className="w-4 h-4" />}
                    <span className="capitalize">{member.role}</span>
                  </div>

                  {member.role !== 'owner' && (
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Role Descriptions */}
        <Card className="p-6 bg-muted/30">
          <h3 className="font-semibold mb-4">Role Permissions</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium">Owner</p>
                <p className="text-muted-foreground">Full control, can delete project, transfer ownership</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Edit className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-muted-foreground">Can invite/remove members, edit project settings, manage songs</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Member</p>
                <p className="text-muted-foreground">Can edit songs, participate in chat/video sessions, add comments</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Viewer</p>
                <p className="text-muted-foreground">Read-only access, can view songs and sessions but cannot edit</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

