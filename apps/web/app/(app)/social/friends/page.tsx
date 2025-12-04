'use client';

import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Heart,
  Search,
  Loader2,
  ArrowRight,
  Clock,
  Check,
  X,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import { EmptyState } from '@/components/empty-states';
import { UsersSkeleton } from '@/components/loading-skeletons';

type TabType = 'friends' | 'requests' | 'sent';

interface Friend {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  followerCount: number;
  mutualFriends?: number;
}

interface FriendRequest {
  id: string;
  fromUser?: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
  toUser?: {
    id: string;
    name: string | null;
    image: string | null;
    email: string;
  };
  createdAt: string;
}

export default function FriendsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'friends';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsRes, receivedRes, sentRes] = await Promise.all([
        fetch('/api/social/friends'),
        fetch('/api/social/friend-requests?type=received'),
        fetch('/api/social/friend-requests?type=sent'),
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
      }

      if (receivedRes.ok) {
        const data = await receivedRes.json();
        setReceivedRequests(data.requests || []);
      }

      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = useCallback(
    async (requestId: string, fromUserId: string) => {
      setProcessingId(requestId);
      try {
        const response = await fetch(`/api/social/friend-requests/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'accept' }),
        });

        if (response.ok) {
          // Move from requests to friends
          const request = receivedRequests.find((r) => r.id === requestId);
          if (request?.fromUser) {
            setFriends((prev) => [
              ...prev,
              {
                id: request.fromUser!.id,
                name: request.fromUser!.name,
                image: request.fromUser!.image,
                email: request.fromUser!.email,
                followerCount: 0,
              },
            ]);
          }
          setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
        }
      } catch (error) {
        console.error('Error accepting request:', error);
      } finally {
        setProcessingId(null);
      }
    },
    [receivedRequests]
  );

  const handleDecline = useCallback(async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/social/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      if (response.ok) {
        setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setProcessingId(null);
    }
  }, []);

  const handleCancelSent = useCallback(async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/social/friend-requests/${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
    } finally {
      setProcessingId(null);
    }
  }, []);

  const handleUnfriend = useCallback(async (friendId: string) => {
    setProcessingId(friendId);
    try {
      const response = await fetch(`/api/community/users/${friendId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setFriends((prev) => prev.filter((f) => f.id !== friendId));
      }
    } catch (error) {
      console.error('Error unfriending:', error);
    } finally {
      setProcessingId(null);
    }
  }, []);

  const filteredFriends = friends.filter(
    (friend) =>
      !searchQuery ||
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-4xl px-4 py-8">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                style={{
                  display: 'flex',
                  height: '56px',
                  width: '56px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                }}
              >
                <Heart style={{ height: '28px', width: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  Friends
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Manage your musician connections
                </p>
              </div>
            </div>

            <Link href="/social/discover">
              <button
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <UserPlus className="h-4 w-4" />
                Find Friends
              </button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab('friends')}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'friends' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: activeTab === 'friends' ? 'none' : '1px solid var(--border)',
              }}
            >
              <Heart className="mr-2 inline-block h-4 w-4" />
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'requests' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: activeTab === 'requests' ? 'none' : '1px solid var(--border)',
                position: 'relative',
              }}
            >
              <UserPlus className="mr-2 inline-block h-4 w-4" />
              Requests
              {receivedRequests.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '9999px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {receivedRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                transition: 'all 0.2s',
                backgroundColor: activeTab === 'sent' ? 'var(--accent)' : 'var(--bg)',
                color: 'var(--text)',
                border: activeTab === 'sent' ? 'none' : '1px solid var(--border)',
              }}
            >
              <Clock className="mr-2 inline-block h-4 w-4" />
              Sent ({sentRequests.length})
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Search (only for friends tab) */}
        {activeTab === 'friends' && friends.length > 0 && (
          <div className="relative mb-6">
            <Search
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '20px',
                width: '20px',
                color: 'var(--muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              style={{
                width: '100%',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--panel)',
                padding: '14px 48px',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
          </div>
        )}

        {loading ? (
          <UsersSkeleton count={6} />
        ) : (
          <>
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <>
                {filteredFriends.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--panel)',
                      padding: '48px',
                      textAlign: 'center',
                    }}
                  >
                    <Heart
                      style={{
                        margin: '0 auto 16px',
                        height: '64px',
                        width: '64px',
                        color: 'var(--muted)',
                      }}
                    />
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text)',
                        marginBottom: '8px',
                      }}
                    >
                      {searchQuery ? 'No friends found' : 'No friends yet'}
                    </h3>
                    <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                      {searchQuery
                        ? 'Try a different search'
                        : 'Start connecting with other musicians!'}
                    </p>
                    {!searchQuery && (
                      <Link href="/social/discover">
                        <button
                          style={{
                            padding: '12px 32px',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: '600',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                          Find Musicians
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredFriends.map((friend) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--panel)',
                          padding: '16px',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/social/profile/${friend.id}`}
                            className="flex flex-1 items-center gap-4"
                          >
                            <div
                              style={{
                                height: '56px',
                                width: '56px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: 'var(--accent-dim)',
                                flexShrink: 0,
                              }}
                            >
                              {friend.image ? (
                                <img
                                  src={friend.image}
                                  alt={friend.name || 'Friend'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Users
                                    style={{
                                      height: '24px',
                                      width: '24px',
                                      color: 'var(--accent)',
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 style={{ fontWeight: '600', color: 'var(--text)' }}>
                                  {friend.name || 'Anonymous'}
                                </h3>
                                <UserCheck className="h-4 w-4" style={{ color: '#22c55e' }} />
                              </div>
                              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                                {friend.followerCount} followers
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={() => handleUnfriend(friend.id)}
                            disabled={processingId === friend.id}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                            }}
                          >
                            {processingId === friend.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Unfriend'
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <>
                {receivedRequests.length === 0 ? (
                  <EmptyState
                    type="messages"
                    title="No friend requests"
                    description="When musicians want to connect, their requests will appear here"
                    actionLabel="Discover Musicians"
                    actionHref="/discover"
                  />
                ) : (
                  <div className="space-y-4">
                    {receivedRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--panel)',
                          padding: '20px',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/social/profile/${request.fromUser?.id}`}
                            className="flex flex-1 items-center gap-4"
                          >
                            <div
                              style={{
                                height: '56px',
                                width: '56px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: 'var(--accent-dim)',
                                flexShrink: 0,
                              }}
                            >
                              {request.fromUser?.image ? (
                                <img
                                  src={request.fromUser.image}
                                  alt={request.fromUser.name || 'User'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Users
                                    style={{
                                      height: '24px',
                                      width: '24px',
                                      color: 'var(--accent)',
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 style={{ fontWeight: '600', color: 'var(--text)' }}>
                                {request.fromUser?.name || 'Anonymous'}
                              </h3>
                              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                Wants to be your friend
                              </p>
                            </div>
                          </Link>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(request.id, request.fromUser?.id || '')}
                              disabled={processingId === request.id}
                              style={{
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--accent)',
                                color: 'white',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              {processingId === request.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4" />
                                  Accept
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleDecline(request.id)}
                              disabled={processingId === request.id}
                              style={{
                                padding: '10px 20px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Sent Tab */}
            {activeTab === 'sent' && (
              <>
                {sentRequests.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--panel)',
                      padding: '48px',
                      textAlign: 'center',
                    }}
                  >
                    <Clock
                      style={{
                        margin: '0 auto 16px',
                        height: '64px',
                        width: '64px',
                        color: 'var(--muted)',
                      }}
                    />
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text)',
                        marginBottom: '8px',
                      }}
                    >
                      No pending requests
                    </h3>
                    <p style={{ color: 'var(--muted)' }}>
                      Friend requests you've sent will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--panel)',
                          padding: '20px',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/social/profile/${request.toUser?.id}`}
                            className="flex flex-1 items-center gap-4"
                          >
                            <div
                              style={{
                                height: '56px',
                                width: '56px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: 'var(--accent-dim)',
                                flexShrink: 0,
                              }}
                            >
                              {request.toUser?.image ? (
                                <img
                                  src={request.toUser.image}
                                  alt={request.toUser.name || 'User'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Users
                                    style={{
                                      height: '24px',
                                      width: '24px',
                                      color: 'var(--accent)',
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 style={{ fontWeight: '600', color: 'var(--text)' }}>
                                {request.toUser?.name || 'Anonymous'}
                              </h3>
                              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                <Clock className="mr-1 inline-block h-3 w-3" />
                                Pending
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={() => handleCancelSent(request.id)}
                            disabled={processingId === request.id}
                            style={{
                              padding: '10px 20px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              fontWeight: '500',
                            }}
                          >
                            {processingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Cancel Request'
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
