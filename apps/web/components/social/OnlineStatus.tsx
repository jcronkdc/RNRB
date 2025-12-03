'use client';

import { useState, useEffect } from 'react';
import { Users, Loader2 } from '@/components/ui/custom-icons';
import Link from 'next/link';

interface OnlineUser {
  id: string;
  name: string | null;
  image: string | null;
  activity: string | null;
}

interface OnlineStatusProps {
  limit?: number;
  showHeader?: boolean;
}

const ACTIVITY_LABELS: Record<string, string> = {
  writing: 'Writing',
  recording: 'Recording',
  practicing: 'Practicing',
  listening: 'Listening',
  mixing: 'Mixing',
  jamming: 'Jamming',
  learning: 'Learning',
  composing: 'Composing',
};

export function OnlineStatus({ limit = 5, showHeader = true }: OnlineStatusProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnlineUsers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch(`/api/social/online?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--muted)' }} />
          <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      {showHeader && (
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: 'pulse 2s infinite',
              }}
            />
            <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.875rem' }}>
              Online Now
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {onlineUsers.length} active
          </span>
        </div>
      )}

      {onlineUsers.length === 0 ? (
        <div className="p-4 text-center">
          <Users
            style={{ margin: '0 auto 8px', height: '24px', width: '24px', color: 'var(--muted)' }}
          />
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>No friends online right now</p>
        </div>
      ) : (
        <div className="space-y-1 p-2">
          {onlineUsers.map((user) => (
            <Link
              key={user.id}
              href={`/social/profile/${user.id}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-all hover:bg-white/5"
            >
              <div className="relative">
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: 'var(--panel)',
                  }}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'User'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Users style={{ height: '16px', width: '16px', color: 'var(--muted)' }} />
                    </div>
                  )}
                </div>
                {/* Online indicator */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    border: '2px solid var(--bg)',
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  style={{
                    fontWeight: '500',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.name || 'Anonymous'}
                </p>
                {user.activity && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {ACTIVITY_LABELS[user.activity] || 'Active'}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

// Simple online indicator dot component
export function OnlineIndicator({
  isOnline,
  size = 'sm',
}: {
  isOnline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: { dot: '8px', border: '2px' },
    md: { dot: '10px', border: '2px' },
    lg: { dot: '12px', border: '3px' },
  };

  const { dot, border } = sizes[size];

  return (
    <div
      style={{
        width: dot,
        height: dot,
        borderRadius: '50%',
        backgroundColor: isOnline ? '#22c55e' : '#71717a',
        border: `${border} solid var(--bg)`,
      }}
    />
  );
}
