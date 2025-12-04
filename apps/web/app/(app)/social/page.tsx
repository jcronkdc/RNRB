'use client';

import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Heart,
  MessageCircle,
  Bell,
  TrendingUp,
  Music,
  Loader2,
  ArrowRight,
  Sparkles,
  Eye,
  UserCheck,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SocialFeed } from '@/components/social-feed/SocialFeed';
import { ActivityStatus } from '@/components/social/ActivityStatus';
import { OnlineStatus } from '@/components/social/OnlineStatus';
import { DashboardStatsSkeleton } from '@/components/loading-skeletons';

interface SocialStats {
  followers: number;
  following: number;
  friends: number;
  pendingRequests: number;
  unreadMessages: number;
  profileViews: number;
}

interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: string;
}

export default function SocialPage() {
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      const [statsRes, requestsRes] = await Promise.all([
        fetch('/api/social/stats'),
        fetch('/api/social/friend-requests?type=received&limit=3'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setFriendRequests(requestsData.requests || []);
      }
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'decline') => {
    setProcessingRequest(requestId);
    try {
      const response = await fetch(`/api/social/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (action === 'accept' && stats) {
          setStats((prev) =>
            prev
              ? { ...prev, friends: prev.friends + 1, pendingRequests: prev.pendingRequests - 1 }
              : null
          );
        }
      }
    } catch (error) {
      console.error('Error processing friend request:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-7xl px-4 py-6">
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
                  background: 'linear-gradient(135deg, var(--accent) 0%, #ff6b6b 100%)',
                }}
              >
                <Sparkles style={{ height: '28px', width: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  Social Hub
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Connect with musicians worldwide
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link href="/social/friends">
                <button
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
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
              <Link href="/social/profile">
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
                  My Profile
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Feed - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SocialFeed />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Activity Status */}
            <ActivityStatus />

            {/* Stats Cards */}
            {loading ? (
              <DashboardStatsSkeleton />
            ) : (
              <>
                {/* Your Stats */}
                <div
                  style={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--panel)',
                    padding: '20px',
                  }}
                >
                  <h3 style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                    Your Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/social/network?tab=friends">
                      <div
                        className="rounded-xl p-4 transition-all hover:scale-105"
                        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        <Heart className="mb-2 h-5 w-5" style={{ color: '#ff6b6b' }} />
                        <div
                          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}
                        >
                          {stats?.friends || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Friends</div>
                      </div>
                    </Link>
                    <Link href="/social/network?tab=followers">
                      <div
                        className="rounded-xl p-4 transition-all hover:scale-105"
                        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        <Users className="mb-2 h-5 w-5" style={{ color: 'var(--accent)' }} />
                        <div
                          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}
                        >
                          {stats?.followers || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Followers</div>
                      </div>
                    </Link>
                    <Link href="/social/messages">
                      <div
                        className="rounded-xl p-4 transition-all hover:scale-105"
                        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        <MessageCircle className="mb-2 h-5 w-5" style={{ color: '#22c55e' }} />
                        <div
                          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}
                        >
                          {stats?.unreadMessages || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Messages</div>
                      </div>
                    </Link>
                    <Link href="/social/profile">
                      <div
                        className="rounded-xl p-4 transition-all hover:scale-105"
                        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        <Eye className="mb-2 h-5 w-5" style={{ color: '#8b5cf6' }} />
                        <div
                          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}
                        >
                          {stats?.profileViews || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          Profile Views
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Friend Requests */}
                {(friendRequests.length > 0 || (stats?.pendingRequests || 0) > 0) && (
                  <div
                    style={{
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--panel)',
                      padding: '20px',
                    }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 style={{ fontWeight: '600', color: 'var(--text)' }}>Friend Requests</h3>
                      {(stats?.pendingRequests || 0) > 0 && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--accent)',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          {stats?.pendingRequests}
                        </span>
                      )}
                    </div>

                    {friendRequests.length > 0 ? (
                      <div className="space-y-3">
                        {friendRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center gap-3 rounded-xl p-3"
                            style={{ backgroundColor: 'var(--bg)' }}
                          >
                            <div
                              style={{
                                height: '40px',
                                width: '40px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: 'var(--accent-dim)',
                                flexShrink: 0,
                              }}
                            >
                              {request.fromUser.image ? (
                                <img
                                  src={request.fromUser.image}
                                  alt={request.fromUser.name || 'User'}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Users
                                    style={{
                                      height: '16px',
                                      width: '16px',
                                      color: 'var(--accent)',
                                    }}
                                  />
                                </div>
                              )}
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
                                {request.fromUser.name || 'Anonymous'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFriendRequest(request.id, 'accept')}
                                disabled={processingRequest === request.id}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--accent)',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                }}
                              >
                                {processingRequest === request.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Accept'
                                )}
                              </button>
                              <button
                                onClick={() => handleFriendRequest(request.id, 'decline')}
                                disabled={processingRequest === request.id}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text)',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                }}
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                        <Link href="/social/friends?tab=requests">
                          <button
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg)',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                            }}
                          >
                            See All Requests
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                        No pending friend requests
                      </p>
                    )}
                  </div>
                )}

                {/* Online Friends */}
                <div
                  style={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--panel)',
                    overflow: 'hidden',
                  }}
                >
                  <OnlineStatus limit={8} showHeader={true} />
                </div>

                {/* Quick Links */}
                <div
                  style={{
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--panel)',
                    padding: '20px',
                  }}
                >
                  <h3 style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    <Link href="/social/explore">
                      <div
                        className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/5"
                        style={{ backgroundColor: 'var(--bg)' }}
                      >
                        <TrendingUp className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                        <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                          Explore Trending
                        </span>
                      </div>
                    </Link>
                    <Link href="/social/discover">
                      <div
                        className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/5"
                        style={{ backgroundColor: 'var(--bg)' }}
                      >
                        <UserPlus className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                        <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                          Find Musicians
                        </span>
                      </div>
                    </Link>
                    <Link href="/social/network">
                      <div
                        className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/5"
                        style={{ backgroundColor: 'var(--bg)' }}
                      >
                        <Users className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                        <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>
                          My Network
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
