'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let fullEmail = email;
    if (!email.includes('@')) {
      fullEmail = `${email}@rnrb.me`;
    } else if (!email.endsWith('@rnrb.me')) {
      setError('Only @rnrb.me email addresses are supported');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://rnrb.pro/api/email/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fullEmail,
          action: 'request',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="transition-theme flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <Image src="/logo-dark.png" alt="RNRB Mail" width={120} height={42} className="mb-4" />
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          {!submitted ? (
            <>
              <h1
                className="mb-2 text-center text-lg font-semibold"
                style={{ color: 'var(--text)' }}
              >
                Reset your password
              </h1>
              <p className="mb-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Enter your email and we&apos;ll send you a reset link
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@rnrb.me"
                    className="input"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div
                    className="rounded-md px-3 py-2 text-sm"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn btn-primary w-full py-2.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'var(--accent-light)' }}
              >
                <Mail className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <h1 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                Check your email
              </h1>
              <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                If an account exists for that email, we&apos;ve sent a password reset link.
              </p>
              <p className="mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="text-sm transition-colors hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Try a different email
              </button>
            </div>
          )}
        </div>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
