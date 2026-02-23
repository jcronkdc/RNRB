'use client';

/**
 * SONG REQUEST MANAGER COMPONENT
 *
 * Admin interface for reviewing and approving/rejecting song requests
 * Displays in the setlist page sidebar or modal
 */

import { Button, Card } from '@cronkwaters/ui';
import { motion } from 'motion/react';
import {
  Music,
  User,
  Mail,
  MessageSquare,
  Heart,
  Check,
  X,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
} from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

import { formatDateLong } from '@/lib/format-date';

type SongRequest = {
  id: string;
  songTitle: string;
  requestedBy: string;
  email?: string;
  message?: string;
  dedication?: string;
  status: 'pending' | 'approved' | 'rejected';
  responseMessage?: string;
  respondedAt?: string;
  createdAt: string;
};

interface SongRequestManagerProps {
  setlistId: string;
  projectId: string;
}

export function SongRequestManager({ setlistId, projectId }: SongRequestManagerProps) {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [setlistId]);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/song-requests?setlistId=${setlistId}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      } else {
        setError('Failed to load requests');
      }
    } catch (err) {
      setError('Error loading requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/song-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          responseMessage: "Thanks for your request! We'll do our best to include it.",
        }),
      });

      if (response.ok) {
        loadRequests();
      } else {
        setError('Failed to approve request');
      }
    } catch (err) {
      setError('Error approving request');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`/api/song-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          responseMessage: "Thanks for your request, but we won't be able to include it this time.",
        }),
      });

      if (response.ok) {
        loadRequests();
      } else {
        setError('Failed to reject request');
      }
    } catch (err) {
      setError('Error rejecting request');
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const reviewedRequests = requests.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Song Requests</h2>
          <p className="text-sm text-muted-foreground">
            {pendingRequests.length} pending, {reviewedRequests.length} reviewed
          </p>
        </div>
        <Button onClick={loadRequests} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <Card className="rnrb-card p-8 text-center">
          <Music className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-semibold">No Requests Yet</h3>
          <p className="text-sm text-muted-foreground">
            Share the request link with fans so they can submit song requests!
          </p>
          <div className="mt-4 rounded-xl border border-border bg-surface/50 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Request Link:</p>
            <code className="text-xs text-brand-primary">
              {typeof window !== 'undefined' && `${window.location.origin}/request/${setlistId}`}
            </code>
          </div>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-yellow-500" />
            Pending Approval ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request.id)}
                onReject={() => handleReject(request.id)}
                processing={processingId === request.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Requests */}
      {reviewedRequests.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold">Reviewed ({reviewedRequests.length})</h3>
          <div className="space-y-3">
            {reviewedRequests.map((request) => (
              <RequestCard key={request.id} request={request} reviewed />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  onApprove,
  onReject,
  processing = false,
  reviewed = false,
}: {
  request: SongRequest;
  onApprove?: () => void;
  onReject?: () => void;
  processing?: boolean;
  reviewed?: boolean;
}) {
  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-500 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
  };

  const StatusIcon = statusIcons[request.status];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`rnrb-card p-4 ${reviewed ? 'opacity-75' : ''}`}>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="mb-1 truncate text-base font-semibold">{request.songTitle}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{request.requestedBy}</span>
              {request.email && (
                <>
                  <span>•</span>
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{request.email}</span>
                </>
              )}
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${
              statusColors[request.status]
            }`}
          >
            <StatusIcon className="h-3 w-3" />
            {request.status}
          </span>
        </div>

        {/* Message */}
        {request.message && (
          <div className="mb-3 rounded-lg border border-border bg-surface/50 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              Message
            </div>
            <p className="text-sm">{request.message}</p>
          </div>
        )}

        {/* Dedication */}
        {request.dedication && (
          <div className="mb-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-purple-400">
              <Heart className="h-3 w-3" />
              Dedication
            </div>
            <p className="text-sm text-purple-200">{request.dedication}</p>
          </div>
        )}

        {/* Actions (for pending requests) */}
        {!reviewed && onApprove && onReject && (
          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button
              onClick={onReject}
              disabled={processing}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 text-xs"
            >
              {processing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              Reject
            </Button>
            <Button
              onClick={onApprove}
              disabled={processing}
              className="flex items-center gap-1.5 bg-green-600 text-xs hover:bg-green-700"
              size="sm"
            >
              {processing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Approve
            </Button>
          </div>
        )}

        {/* Timestamp */}
        <p className="mt-2 text-xs text-muted-foreground">
          Requested {formatDateLong(request.createdAt)}
          {request.respondedAt && ` • Reviewed ${formatDateLong(request.respondedAt)}`}
        </p>
      </Card>
    </motion.div>
  );
}
