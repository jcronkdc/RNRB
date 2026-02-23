'use client';

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Users,
  UserPlus,
  Trash2,
  Check,
  X,
  Loader2,
  ChevronRight,
  Shield,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { EmptyState } from '@/components/empty-states';
import { InboxSkeleton } from '@/components/loading-skeletons';

interface MessageRequest {
  id: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
    email: string;
  };
  latestMessage: {
    id: string;
    content: string;
    createdAt: string;
  };
  messageCount: number;
  channelId: string;
}

export default function MessageRequestsPage() {
  const [requests, setRequests] = useState<MessageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/messages/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching message requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = useCallback(async (request: MessageRequest) => {
    setProcessingId(request.id);
    try {
      const response = await fetch(`/api/messages/requests/${request.channelId}`, {
        method: 'POST',
      });

      if (response.ok) {
        // Remove from requests and potentially redirect to chat
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setProcessingId(null);
    }
  }, []);

  const handleDelete = useCallback(async (request: MessageRequest) => {
    setProcessingId(request.id);
    try {
      const response = await fetch(`/api/messages/requests/${request.channelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      setProcessingId(null);
    }
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-2xl px-4 py-8">
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
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                }}
              >
                <Shield style={{ height: '28px', width: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                  Message Requests
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  Messages from people you haven't connected with
                </p>
              </div>
            </div>

            <Link href="/messages">
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
                <MessageSquare className="h-4 w-4" />
                Back to Messages
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Info Banner */}
        <div
          className="mb-6 flex items-start gap-4 rounded-xl p-4"
          style={{ backgroundColor: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
        >
          <Shield className="h-5 w-5 shrink-0" style={{ color: 'var(--accent)' }} />
          <div>
            <p style={{ fontWeight: '500', color: 'var(--text)', marginBottom: '4px' }}>
              These messages are from people you don't know
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
              Accepting a request will allow them to message you directly. If you're not interested,
              you can delete the request.
            </p>
          </div>
        </div>

        {loading ? (
          <InboxSkeleton count={4} />
        ) : requests.length === 0 ? (
          <EmptyState
            type="messages"
            title="No message requests"
            description="When someone you don't know messages you, it will appear here"
            actionLabel="View Inbox"
            actionHref="/social/messages/inbox"
          />
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--panel)',
                  overflow: 'hidden',
                }}
              >
                {/* Main Content */}
                <div
                  className="cursor-pointer p-4 transition-all hover:bg-white/5"
                  onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: 'var(--bg)',
                        flexShrink: 0,
                      }}
                    >
                      {request.sender.image ? (
                        <img
                          src={request.sender.image}
                          alt={request.sender.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Users style={{ height: '24px', width: '24px', color: 'var(--muted)' }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 style={{ fontWeight: '600', color: 'var(--text)', fontSize: '1rem' }}>
                          {request.sender.name}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {formatTime(request.latestMessage.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{
                          color: 'var(--muted)',
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {request.latestMessage.content}
                      </p>
                      {request.messageCount > 1 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                          {request.messageCount} messages
                        </p>
                      )}
                    </div>

                    {/* Expand Icon */}
                    <ChevronRight
                      className="h-5 w-5 transition-transform"
                      style={{
                        color: 'var(--muted)',
                        transform: expandedId === request.id ? 'rotate(90deg)' : 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedId === request.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <div className="flex gap-3 p-4">
                      <Link href={`/social/profile/${request.sender.id}`} className="flex-1">
                        <button
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                          }}
                        >
                          <Users className="h-4 w-4" />
                          View Profile
                        </button>
                      </Link>
                      <button
                        onClick={() => handleAccept(request)}
                        disabled={processingId === request.id}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        {processingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(request)}
                        disabled={processingId === request.id}
                        style={{
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
