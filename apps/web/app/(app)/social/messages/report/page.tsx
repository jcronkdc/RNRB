'use client';

import { motion } from 'motion/react';
import {
  Flag,
  Shield,
  ChevronLeft,
  AlertTriangle,
  Ban,
  UserX,
  MessageSquareOff,
  DollarSign,
  Ghost,
  AlertCircle,
  Loader2,
  Check,
} from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const REPORT_REASONS = [
  {
    id: 'spam',
    label: 'Spam',
    description: 'Unsolicited commercial messages or repetitive content',
    icon: MessageSquareOff,
  },
  {
    id: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Threats, hate speech, or intimidating behavior',
    icon: AlertTriangle,
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Adult content, violence, or graphic material',
    icon: Ban,
  },
  {
    id: 'scam',
    label: 'Scam or Fraud',
    description: 'Attempts to steal money, credentials, or personal info',
    icon: DollarSign,
  },
  {
    id: 'impersonation',
    label: 'Impersonation',
    description: 'Pretending to be someone else',
    icon: Ghost,
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Something else that violates our community guidelines',
    icon: AlertCircle,
  },
];

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const messageId = searchParams.get('message');

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationInfo, setConversationInfo] = useState<any>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversationInfo();
    }
  }, [conversationId]);

  const fetchConversationInfo = async () => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setConversationInfo(data);
      }
    } catch {
      // Ignore
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason for your report');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/messages/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messageId,
          reportedUserId: conversationInfo?.participant?.id,
          reason: selectedReason,
          details,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      // Optionally block the user
      if (alsoBlock && conversationId) {
        await fetch(`/api/messages/conversations/${conversationId}/block`, {
          method: 'POST',
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
        <div className="mx-auto max-w-2xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--panel)',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
            >
              <Check className="h-10 w-10" style={{ color: '#10b981' }} />
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--text)',
                marginBottom: '16px',
              }}
            >
              Report Submitted
            </h1>
            <p
              style={{
                color: 'var(--muted)',
                marginBottom: '24px',
                maxWidth: '400px',
                margin: '0 auto 24px',
              }}
            >
              Thank you for helping keep our community safe. Our team will review your report and
              take appropriate action.
            </p>
            {alsoBlock && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--muted)',
                  marginBottom: '24px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg)',
                }}
              >
                <Shield className="mr-2 inline h-4 w-4" style={{ color: 'var(--accent)' }} />
                The user has been blocked. They can no longer message you.
              </p>
            )}
            <div className="flex justify-center gap-4">
              <Link href="/social/messages/inbox">
                <button
                  style={{
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    fontWeight: '600',
                  }}
                >
                  Back to Messages
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

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
            <Link href="/social/messages/inbox">
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
              <Flag style={{ height: '24px', width: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                Report a Problem
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                Help us keep the community safe
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* User Info */}
        {conversationInfo?.participant && (
          <div
            className="mb-6 flex items-center gap-4 rounded-xl p-4"
            style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--bg)',
              }}
            >
              {conversationInfo.participant.image ? (
                <img
                  src={conversationInfo.participant.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserX className="h-6 w-6" style={{ color: 'var(--muted)' }} />
                </div>
              )}
            </div>
            <div>
              <p style={{ fontWeight: '600', color: 'var(--text)' }}>
                Reporting: {conversationInfo.participant.name || 'Unknown User'}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                {conversationInfo.messageCount} messages in conversation
              </p>
            </div>
          </div>
        )}

        {/* Report Reasons */}
        <div
          className="mb-6 rounded-xl"
          style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
            <h2 style={{ fontWeight: '600', color: 'var(--text)' }}>
              Why are you reporting this conversation?
            </h2>
          </div>
          <div className="p-2">
            {REPORT_REASONS.map((reason) => {
              const Icon = reason.icon;
              const isSelected = selectedReason === reason.id;

              return (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className="flex w-full items-center gap-4 rounded-lg p-4 transition-all hover:bg-white/5"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-dim)' : 'transparent',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: isSelected ? 'white' : 'var(--muted)' }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p style={{ fontWeight: '600', color: 'var(--text)' }}>{reason.label}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                      {reason.description}
                    </p>
                  </div>
                  {isSelected && <Check className="h-5 w-5" style={{ color: 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Details */}
        <div
          className="mb-6 rounded-xl"
          style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
            <h2 style={{ fontWeight: '600', color: 'var(--text)' }}>
              Additional details (optional)
            </h2>
          </div>
          <div className="p-4">
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context that might help us understand the situation..."
              rows={4}
              maxLength={1000}
              style={{
                width: '100%',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                padding: '12px',
                color: 'var(--text)',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '8px' }}>
              {details.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Block Option */}
        <div
          className="mb-6 rounded-xl"
          style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <label className="flex cursor-pointer items-center gap-4 p-4">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
              className="h-5 w-5 rounded accent-[var(--accent)]"
            />
            <div>
              <p style={{ fontWeight: '600', color: 'var(--text)' }}>Also block this user</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                They won't be able to message you or see your profile
              </p>
            </div>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 flex items-center gap-3 rounded-xl p-4"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}
          >
            <AlertCircle className="h-5 w-5" style={{ color: '#ef4444' }} />
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedReason || submitting}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: selectedReason ? '#ef4444' : 'var(--muted)',
            color: 'white',
            fontWeight: '600',
            opacity: selectedReason && !submitting ? 1 : 0.7,
            cursor: selectedReason && !submitting ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting Report...
            </>
          ) : (
            <>
              <Flag className="h-5 w-5" />
              Submit Report
            </>
          )}
        </button>

        {/* Info */}
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--muted)',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          We take all reports seriously and will review your submission within 24 hours. You may be
          contacted if we need additional information.
        </p>
      </div>
    </div>
  );
}
