'use client';

import {
  Globe,
  Check,
  X,
  Loader2,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
} from '@/components/ui/custom-icons';
import { useState, useEffect } from 'react';

interface DomainStatus {
  customDomain: string | null;
  domainVerified: boolean;
  subdomain: string;
  verificationToken: string | null;
  defaultUrl: string;
  customUrl: string | null;
}

interface DomainInstructions {
  step1: {
    title: string;
    description: string;
    record: { type: string; name: string; value: string };
  };
  step2: {
    title: string;
    description: string;
    record: { type: string; name: string; value: string };
    alternative: { description: string; type: string; name: string; value: string };
  };
}

export function DomainSettings() {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<DomainStatus | null>(null);
  const [instructions, setInstructions] = useState<DomainInstructions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    nextSteps?: unknown;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Fetch current domain status
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/sites/domain');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      console.error('Failed to fetch domain status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!domain.trim()) return;

    setIsAdding(true);
    setError(null);
    setVerifyResult(null);

    try {
      const res = await fetch('/api/sites/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add domain');
        return;
      }

      setInstructions(data.instructions);
      await fetchStatus();
      setDomain('');
    } catch {
      setError('Failed to add domain');
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    setVerifyResult(null);

    try {
      const res = await fetch('/api/sites/domain/verify', {
        method: 'POST',
      });

      const data = await res.json();
      setVerifyResult(data);

      if (data.verified) {
        await fetchStatus();
      }
    } catch {
      setError('Failed to verify domain');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this custom domain?')) return;

    setIsRemoving(true);
    setError(null);

    try {
      const res = await fetch('/api/sites/domain', {
        method: 'DELETE',
      });

      if (res.ok) {
        setInstructions(null);
        setVerifyResult(null);
        await fetchStatus();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to remove domain');
      }
    } catch {
      setError('Failed to remove domain');
    } finally {
      setIsRemoving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Domain Status */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Globe size={20} style={{ color: 'var(--accent)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
            Custom Domain
          </h3>
        </div>

        {/* Default URL */}
        <div className="mb-4 rounded-lg p-4" style={{ background: 'var(--bg)' }}>
          <p className="mb-1 text-sm" style={{ color: 'var(--muted)' }}>
            Default URL (always works)
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 rounded px-2 py-1 text-sm"
              style={{ background: 'var(--panel)' }}
            >
              {status?.defaultUrl}
            </code>
            <a
              href={status?.defaultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-2 transition-colors hover:bg-white/10"
              style={{ color: 'var(--muted)' }}
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Custom Domain Status */}
        {status?.customDomain ? (
          <div className="space-y-4">
            <div
              className="flex items-center justify-between rounded-lg p-4"
              style={{ background: 'var(--bg)' }}
            >
              <div>
                <p className="mb-1 text-sm" style={{ color: 'var(--muted)' }}>
                  Custom Domain
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                    {status.customDomain}
                  </code>
                  {status.domainVerified ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                      <Check size={12} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                      <AlertCircle size={12} /> Pending Verification
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
              >
                {isRemoving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              </button>
            </div>

            {/* Verification Section */}
            {!status.domainVerified && (
              <div className="space-y-4">
                {/* DNS Instructions */}
                <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                  <h4 className="mb-3 font-medium" style={{ color: 'var(--text)' }}>
                    Step 1: Verify Ownership
                  </h4>
                  <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                    Add this TXT record to your DNS settings:
                  </p>
                  <div className="space-y-2">
                    <DNSRecord
                      type="TXT"
                      name={`_cronkwaters.${status.customDomain}`}
                      value={status.verificationToken || ''}
                      onCopy={copyToClipboard}
                      copied={copied}
                    />
                  </div>
                </div>

                <div className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                  <h4 className="mb-3 font-medium" style={{ color: 'var(--text)' }}>
                    Step 2: Point Domain
                  </h4>
                  <p className="mb-3 text-sm" style={{ color: 'var(--muted)' }}>
                    Add one of these records to point your domain to CronkWaters:
                  </p>
                  <div className="space-y-2">
                    <DNSRecord
                      type="CNAME"
                      name="@"
                      value="cname.vercel-dns.com"
                      onCopy={copyToClipboard}
                      copied={copied}
                      preferred
                    />
                    <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
                      — or —
                    </p>
                    <DNSRecord
                      type="A"
                      name="@"
                      value="76.76.21.21"
                      onCopy={copyToClipboard}
                      copied={copied}
                    />
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {isVerifying ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                  {isVerifying ? 'Checking DNS...' : 'Verify Domain'}
                </button>

                {/* Verification Result */}
                {verifyResult && (
                  <div
                    className={`flex items-start gap-3 rounded-lg p-4 ${
                      verifyResult.success ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}
                  >
                    {verifyResult.success ? (
                      <CheckCircle size={20} className="mt-0.5 flex-shrink-0 text-green-400" />
                    ) : (
                      <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-yellow-400" />
                    )}
                    <div>
                      <p className={verifyResult.success ? 'text-green-400' : 'text-yellow-400'}>
                        {verifyResult.message}
                      </p>
                      {!verifyResult.success && (
                        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
                          DNS changes can take up to 48 hours to propagate. Try again later.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Verified Domain */}
            {status.domainVerified && status.customUrl && (
              <div className="flex items-center gap-3 rounded-lg bg-green-500/20 p-4">
                <CheckCircle size={20} className="text-green-400" />
                <div className="flex-1">
                  <p className="font-medium text-green-400">Domain Active!</p>
                  <a
                    href={status.customUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-300 hover:underline"
                  >
                    {status.customUrl} <ExternalLink size={12} className="ml-1 inline" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Add Domain Form */
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Connect your own domain to your CronkWaters website.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="flex-1 rounded-lg px-4 py-3"
                style={{
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
              />
              <button
                onClick={handleAddDomain}
                disabled={isAdding || !domain.trim()}
                className="flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                Add Domain
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/20 p-3 text-red-400">
            <X size={18} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// DNS Record Display Component
function DNSRecord({
  type,
  name,
  value,
  onCopy,
  copied,
  preferred,
}: {
  type: string;
  name: string;
  value: string;
  onCopy: (text: string, label: string) => void;
  copied: string | null;
  preferred?: boolean;
}) {
  const label = `${type}-${name}`;

  return (
    <div
      className="flex items-center gap-3 rounded-lg p-3"
      style={{
        background: 'var(--panel)',
        border: preferred ? '1px solid var(--accent)' : '1px solid var(--border)',
      }}
    >
      <span
        className="rounded px-2 py-1 text-xs font-bold"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        {type}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: 'var(--muted)' }}>Name:</span>
          <code className="truncate" style={{ color: 'var(--text)' }}>
            {name}
          </code>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: 'var(--muted)' }}>Value:</span>
          <code className="truncate" style={{ color: 'var(--text)' }}>
            {value}
          </code>
        </div>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="flex-shrink-0 rounded p-2 transition-colors hover:bg-white/10"
        style={{ color: copied === label ? 'var(--accent)' : 'var(--muted)' }}
      >
        {copied === label ? <Check size={16} /> : <Copy size={16} />}
      </button>
      {preferred && (
        <span className="flex-shrink-0 rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
          Recommended
        </span>
      )}
    </div>
  );
}
