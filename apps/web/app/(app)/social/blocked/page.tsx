'use client';

import { motion } from 'framer-motion';
import {
  UserX,
  Shield,
  Loader2,
  ChevronLeft,
  UserCheck,
  AlertTriangle,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { EmptyState } from '@/components/empty-states';
import { UserListSkeleton } from '@/components/loading-skeletons';

interface BlockedUser {
  id: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
  blockedAt: string;
  reason?: string;
}

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/blocked');
      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blocked || []);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = useCallback(async (userId: string) => {
    setUnblocking(userId);
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlockedUsers((prev) => prev.filter((b) => b.user.id !== userId));
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setUnblocking(null);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex justify-center"
          >
            <Link href="/" className="group inline-block">
              <Image
                src="/logo-dark.png"
                alt="Rock N' Roll Basement"
                width={140}
                height={57}
                priority
                className="transition-opacity duration-200 group-hover:opacity-80"
              />
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            <Link href="/social">
              <button
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--border)',
                }}
              >
                <ChevronLeft className="h-5 w-5" style={{ color: 'var(--text)' }} />
              </button>
            </Link>
            <div
              style={{
                display: 'flex',
                height: '48px',
                width: '48px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
              }}
            >
              <Shield style={{ height: '24px', width: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                Blocked Users
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                Manage your blocked user list
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Info Banner */}
        <div
          className="mb-6 flex items-start gap-3 rounded-xl p-4"
          style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
        >
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <div>
            <p style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
              What happens when you block someone?
            </p>
            <ul
              style={{
                fontSize: '0.875rem',
                color: 'var(--muted)',
                listStyleType: 'disc',
                paddingLeft: '20px',
              }}
            >
              <li>They can't send you messages</li>
              <li>They can't see your profile or posts</li>
              <li>They won't be notified that you blocked them</li>
              <li>Existing messages are hidden but not deleted</li>
            </ul>
          </div>
        </div>

        {/* Blocked Users List */}
        {loading ? (
          <UserListSkeleton count={5} />
        ) : blockedUsers.length === 0 ? (
          <EmptyState
            type="collaborations"
            title="No blocked users"
            description="You haven't blocked anyone. If someone is bothering you, you can block them from their profile or from a conversation."
            actionLabel="Back to Network"
            actionHref="/social/network"
          />
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((blocked) => (
              <motion.div
                key={blocked.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group"
                style={{
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--panel)',
                  padding: '16px',
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg)',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    {blocked.user.image ? (
                      <img
                        src={blocked.user.image}
                        alt={blocked.user.name || 'User'}
                        className="h-full w-full object-cover"
                        style={{ filter: 'grayscale(100%)' }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserX style={{ height: '20px', width: '20px', color: 'var(--muted)' }} />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <UserX className="h-5 w-5" style={{ color: '#ef4444' }} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 style={{ fontWeight: '600', color: 'var(--text)' }}>
                      {blocked.user.name || 'Unknown User'}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                      Blocked on {formatDate(blocked.blockedAt)}
                    </p>
                  </div>

                  {/* Unblock Button */}
                  <button
                    onClick={() => handleUnblock(blocked.user.id)}
                    disabled={unblocking === blocked.user.id}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: unblocking === blocked.user.id ? 'not-allowed' : 'pointer',
                      opacity: unblocking === blocked.user.id ? 0.7 : 1,
                    }}
                  >
                    {unblocking === blocked.user.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Unblocking...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Unblock
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Warning */}
        {blockedUsers.length > 0 && (
          <div
            className="mt-6 flex items-start gap-3 rounded-xl p-4"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b' }}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: '#f59e0b' }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              Unblocking a user will allow them to message you again and see your profile. They
              won't be notified that you unblocked them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
