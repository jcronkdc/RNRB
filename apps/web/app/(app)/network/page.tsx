'use client';

import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Loader2,
  ArrowRight,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

interface NetworkUser {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
  isFollowingBack?: boolean;
  followerCount: number;
}

interface NetworkData {
  followers: NetworkUser[];
  following: NetworkUser[];
  followerCount: number;
  followingCount: number;
}

type TabType = 'following' | 'followers';

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
  const [followingBackId, setFollowingBackId] = useState<string | null>(null);

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    try {
      const response = await fetch('/api/network');
      if (response.ok) {
        const data = await response.json();
        setNetworkData(data);
      }
    } catch (error) {
      console.error('Error fetching network:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = useCallback(async (userId: string) => {
    setUnfollowingId(userId);
    try {
      const response = await fetch(`/api/community/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // Remove from following list
        setNetworkData(prev => prev ? {
          ...prev,
          following: prev.following.filter(u => u.id !== userId),
          followingCount: prev.followingCount - 1,
        } : null);
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    } finally {
      setUnfollowingId(null);
    }
  }, []);

  const handleFollowBack = useCallback(async (userId: string) => {
    setFollowingBackId(userId);
    try {
      const response = await fetch(`/api/community/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // Update follower to show they're now followed
        setNetworkData(prev => prev ? {
          ...prev,
          followers: prev.followers.map(u => 
            u.id === userId ? { ...u, isFollowingBack: true } : u
          ),
          following: [...prev.following, prev.followers.find(u => u.id === userId)!].filter(Boolean),
          followingCount: prev.followingCount + 1,
        } : null);
      }
    } catch (error) {
      console.error('Error following back:', error);
    } finally {
      setFollowingBackId(null);
    }
  }, []);

  const filteredList = (list: NetworkUser[]) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(user => 
      user.name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  };

  const currentList = activeTab === 'following' 
    ? filteredList(networkData?.following || [])
    : filteredList(networkData?.followers || []);

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg)' }}
      >
        <div className="relative">
          <div
            className="absolute inset-0 animate-ping rounded-full"
            style={{ background: 'rgba(232, 93, 59, 0.2)' }}
          />
          <Loader2 className="h-12 w-12 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Loading your network...
        </p>
      </div>
    );
  }

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

          {/* Accent bar */}
          <div
            style={{
              marginBottom: '24px',
              height: '4px',
              width: '48px',
              borderRadius: '2px',
              backgroundColor: 'var(--accent)',
            }}
          />

          <div className="flex items-center gap-4">
            <div
              style={{
                display: 'flex',
                height: '56px',
                width: '56px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <Users style={{ height: '28px', width: '28px', color: 'var(--accent)' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Your Connections</p>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                My Network
              </h1>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-8">
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)' }}>
                {networkData?.followingCount || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Following</div>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text)' }}>
                {networkData?.followerCount || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Followers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('following')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'following' ? 'var(--accent)' : 'var(--panel)',
              color: 'var(--text)',
              border: activeTab === 'following' ? 'none' : '1px solid var(--border)',
            }}
          >
            <UserCheck className="mr-2 inline-block h-4 w-4" />
            Following ({networkData?.followingCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '600',
              transition: 'all 0.2s',
              backgroundColor: activeTab === 'followers' ? 'var(--accent)' : 'var(--panel)',
              color: 'var(--text)',
              border: activeTab === 'followers' ? 'none' : '1px solid var(--border)',
            }}
          >
            <Users className="mr-2 inline-block h-4 w-4" />
            Followers ({networkData?.followerCount || 0})
          </button>
        </div>

        {/* Search */}
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
            placeholder={`Search ${activeTab}...`}
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

        {/* User List */}
        {currentList.length === 0 ? (
          <div
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <Users
              style={{
                margin: '0 auto 16px',
                height: '64px',
                width: '64px',
                color: 'var(--muted)',
              }}
            />
            <h3
              style={{
                marginBottom: '8px',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text)',
              }}
            >
              {activeTab === 'following' ? 'Not following anyone yet' : 'No followers yet'}
            </h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              {activeTab === 'following' 
                ? 'Discover musicians and start building your network'
                : 'Share your profile and create great content to gain followers'}
            </p>
            <Link href="/discover">
              <button
                style={{
                  padding: '12px 32px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '600',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Discover Musicians
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((user) => (
              <motion.div
                key={user.id}
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
                    href={`/community/users/${user.id}`}
                    className="flex items-center gap-4 flex-1"
                  >
                    {/* Avatar */}
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
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || 'User'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Users style={{ height: '24px', width: '24px', color: 'var(--accent)' }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          style={{
                            fontWeight: '600',
                            color: 'var(--text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user.name || 'Anonymous User'}
                        </h3>
                        {activeTab === 'followers' && user.isFollowingBack && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--accent-dim)',
                              color: 'var(--accent)',
                              fontWeight: '500',
                            }}
                          >
                            Following
                          </span>
                        )}
                        {activeTab === 'following' && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              color: '#22c55e',
                              fontWeight: '500',
                            }}
                          >
                            Follows you
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.email}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                        {user.followerCount} followers
                      </p>
                    </div>
                  </Link>

                  {/* Action Button */}
                  {activeTab === 'following' ? (
                    <button
                      onClick={() => handleUnfollow(user.id)}
                      disabled={unfollowingId === user.id}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        opacity: unfollowingId === user.id ? 0.5 : 1,
                        cursor: unfollowingId === user.id ? 'wait' : 'pointer',
                      }}
                    >
                      {unfollowingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Unfollow'
                      )}
                    </button>
                  ) : !user.isFollowingBack ? (
                    <button
                      onClick={() => handleFollowBack(user.id)}
                      disabled={followingBackId === user.id}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--accent)',
                        color: 'var(--text)',
                        border: 'none',
                        opacity: followingBackId === user.id ? 0.5 : 1,
                        cursor: followingBackId === user.id ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {followingBackId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Follow Back
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Discover More CTA */}
        <div
          className="mt-8"
          style={{
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--panel)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
            Grow Your Network
          </h3>
          <p style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '0.875rem' }}>
            Find more musicians to collaborate with
          </p>
          <Link href="/discover">
            <button
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                backgroundColor: 'var(--accent)',
                color: 'var(--text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <UserPlus className="h-4 w-4" />
              Discover Musicians
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

