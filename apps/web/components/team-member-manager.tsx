'use client';

/**
 * TEAM MEMBER ROLE MANAGEMENT
 *
 * Real-time role changes with Ably broadcast
 * Permission-based UI (only owners/admins can change roles)
 * Invite members, change roles, remove members
 *
 * Mycelial Pathway:
 * Owner changes role → Ably broadcasts → All clients update → Server persists
 */

import { Card, Button } from '@cronkwaters/ui';
import Ably from 'ably';
import {
  Users,
  UserPlus,
  Shield,
  Eye,
  Edit,
  Crown,
  Trash2,
  Mail,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

type TeamMember = {
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
};

type RoleChange = {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  changedBy: string;
  timestamp: number;
};

type UseTeamSyncOptions = {
  channelName: string;
  onMemberAdded: (member: TeamMember) => void;
  onMemberRemoved: (userId: string) => void;
  onRoleChanged: (change: RoleChange) => void;
  enabled: boolean;
};

/**
 * Hook: Real-time team sync via Ably
 */
function useTeamSync({
  channelName,
  onMemberAdded,
  onMemberRemoved,
  onRoleChanged,
  enabled,
}: UseTeamSyncOptions) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;
    let ablyClient: Ably.Realtime | null = null;

    const initAbly = async () => {
      try {
        const response = await fetch('/api/ably/token');
        if (!response.ok) {
          console.info('Ably not configured - team sync disabled');
          return;
        }

        ablyClient = new Ably.Realtime({ authUrl: '/api/ably/token' });
        if (!mounted) {
          ablyClient.close();
          return;
        }

        const channel = ablyClient.channels.get(channelName);

        // Subscribe to team events
        channel.subscribe('member-added', (message: Ably.Message) => {
          if (mounted) onMemberAdded(message.data);
        });

        channel.subscribe('member-removed', (message: Ably.Message) => {
          if (mounted) onMemberRemoved(message.data.userId);
        });

        channel.subscribe('role-changed', (message: Ably.Message) => {
          if (mounted) onRoleChanged(message.data);
        });

        setIsConnected(true);
      } catch (error) {
        console.error('Team sync error:', error);
      }
    };

    initAbly();

    return () => {
      mounted = false;
      ablyClient?.close();
      setIsConnected(false);
    };
  }, [channelName, enabled]);

  return { isConnected };
}

/**
 * Main Component: Team Member Management
 */
export function TeamMemberManager({
  projectId,
  projectSlug,
  currentUser,
  currentUserRole,
}: {
  projectId: string;
  projectSlug: string;
  currentUser: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  currentUserRole: 'owner' | 'admin' | 'member' | 'viewer';
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';

  // Real-time team sync
  const { isConnected } = useTeamSync({
    channelName: `team:${projectSlug}`,
    onMemberAdded: (member) => {
      setMembers((prev) => [...prev, member]);
      setMessage({ type: 'success', text: `${member.userName} joined the team` });
    },
    onMemberRemoved: (userId) => {
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setMessage({ type: 'success', text: 'Member removed from team' });
    },
    onRoleChanged: (change) => {
      setMembers((prev) =>
        prev.map((m) => (m.userId === change.userId ? { ...m, role: change.role } : m))
      );
      setMessage({ type: 'success', text: 'Role updated successfully' });
    },
    enabled: true,
  });

  // Load team members
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (!response.ok) throw new Error('Failed to load team');

        const data = await response.json();
        setMembers(data.members || []);
      } catch (error) {
        console.error('Error loading team:', error);
        setMessage({ type: 'error', text: 'Failed to load team members' });
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [projectId]);

  // Invite member
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/invitations/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          receiverEmail: inviteEmail,
          role: inviteRole,
          senderId: currentUser.userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setInviting(false);
    }
  };

  // Change member role
  const changeRole = async (userId: string, newRole: 'owner' | 'admin' | 'member' | 'viewer') => {
    if (!canManageMembers) {
      setMessage({ type: 'error', text: 'You do not have permission to change roles' });
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change role');
      }

      // Broadcast change
      const channel = (window as any).__ablyChannel;
      if (channel) {
        await channel.publish('role-changed', {
          userId,
          role: newRole,
          changedBy: currentUser.userId,
          timestamp: Date.now(),
        });
      }

      // Update locally (will also be updated via Ably)
      setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m)));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Remove member
  const removeMember = async (userId: string) => {
    if (!canManageMembers) {
      setMessage({ type: 'error', text: 'You do not have permission to remove members' });
      return;
    }

    const member = members.find((m) => m.userId === userId);
    if (!member) return;

    if (!confirm(`Remove ${member.userName} from this project?`)) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      // Broadcast removal
      const channel = (window as any).__ablyChannel;
      if (channel) {
        await channel.publish('member-removed', { userId });
      }

      // Update locally
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-400" />;
      case 'member':
        return <Edit className="h-4 w-4 text-blue-400" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'member':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-brand-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display flex items-center gap-3 text-2xl font-bold">
            <Users className="text-brand-primary h-7 w-7" />
            Team Members
          </h2>
          <p className="text-muted-foreground mt-1">
            {members.length} {members.length === 1 ? 'member' : 'members'}
            {isConnected && <span className="ml-2 text-green-400">• Live sync enabled</span>}
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Message */}
      {message && (
        <Card
          className={`flex items-center gap-3 p-4 ${
            message.type === 'success'
              ? 'border-green-500/20 bg-green-500/10'
              : 'border-red-500/20 bg-red-500/10'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
            {message.text}
          </span>
          <button
            onClick={() => setMessage(null)}
            className="text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUser.userId;
          const canChangeThisRole =
            canManageMembers && !isCurrentUser && (isOwner || member.role !== 'owner');

          return (
            <Card key={member.userId} className="rnrb-card p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="bg-brand-primary/20 flex h-12 w-12 items-center justify-center rounded-full">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.userName}
                      className="h-full w-full rounded-full"
                    />
                  ) : (
                    <span className="text-brand-primary text-xl font-bold">
                      {member.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-foreground font-semibold">{member.userName}</h4>
                    {isCurrentUser && (
                      <span className="bg-brand-primary/20 text-brand-primary rounded-full px-2 py-0.5 text-xs font-medium">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{member.userEmail}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Joined {formatDateLong(member.joinedAt)}
                  </p>
                </div>

                {/* Role */}
                <div className="flex items-center gap-3">
                  {canChangeThisRole ? (
                    <select
                      value={member.role}
                      onChange={(e) => changeRole(member.userId, e.target.value as any)}
                      className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium ${getRoleBadgeColor(member.role)} transition hover:brightness-110`}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      {isOwner && <option value="owner">Owner</option>}
                    </select>
                  ) : (
                    <span
                      className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-medium ${getRoleBadgeColor(member.role)}`}
                    >
                      {getRoleIcon(member.role)}
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  )}

                  {/* Remove Button */}
                  {canManageMembers && !isCurrentUser && (
                    <button
                      onClick={() => removeMember(member.userId)}
                      className="text-red-400 transition hover:text-red-300"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowInviteModal(false)}
        >
          <Card className="rnrb-card w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="hover:bg-surface-muted flex h-8 w-8 items-center justify-center rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="border-border bg-surface focus:border-brand-primary focus:ring-brand-primary/10 w-full rounded-xl border-2 px-4 py-3 outline-none focus:ring-4"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="border-border bg-surface focus:border-brand-primary focus:ring-brand-primary/10 w-full rounded-xl border-2 px-4 py-3 outline-none focus:ring-4"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="member">Member (Can edit)</option>
                  <option value="admin">Admin (Can manage team)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowInviteModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex flex-1 items-center justify-center gap-2"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Send Invite
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Role Legend */}
      <Card className="bg-surface-muted p-6">
        <h4 className="text-muted-foreground mb-4 text-sm font-semibold">ROLE PERMISSIONS</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Crown className="mt-0.5 h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium">Owner</p>
              <p className="text-muted-foreground text-xs">Full control, including deletion</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-muted-foreground text-xs">Can manage team and settings</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Edit className="mt-0.5 h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium">Member</p>
              <p className="text-muted-foreground text-xs">Can edit songs and collaborate</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Viewer</p>
              <p className="text-muted-foreground text-xs">Read-only access, no edits</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
