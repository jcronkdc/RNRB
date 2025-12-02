'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

type Step = 'email' | 'password' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let fullEmail = email;
    if (!email.includes('@')) {
      fullEmail = `${email}@rnrb.me`;
    } else if (!email.endsWith('@rnrb.me')) {
      setError('Only @rnrb.me email addresses are supported');
      return;
    }

    setEmail(fullEmail);
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://rnrb.pro/api/email/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
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
          {step === 'email' && (
            <>
              <h1
                className="mb-2 text-center text-lg font-semibold"
                style={{ color: 'var(--text)' }}
              >
                Reset your password
              </h1>
              <p className="mb-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Enter your email address to continue
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                <button type="submit" className="btn btn-primary w-full py-2.5">
                  Continue
                </button>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <h1
                className="mb-2 text-center text-lg font-semibold"
                style={{ color: 'var(--text)' }}
              >
                Create new password
              </h1>
              <p className="mb-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                For {email}
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="input"
                      style={{ paddingRight: '2.75rem' }}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-white/10"
                      style={{ color: 'var(--text-muted)' }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input"
                    required
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
                  disabled={loading}
                  className="btn btn-primary w-full py-2.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'var(--accent-light)' }}
              >
                <CheckCircle className="h-6 w-6" style={{ color: 'var(--accent)' }} />
              </div>
              <h1 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
                Password reset!
              </h1>
              <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                You can now sign in with your new password
              </p>
              <Link href="/login" className="btn btn-primary w-full py-2.5">
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Back to login */}
        {step !== 'success' && (
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
        )}
      </div>
    </div>
  );
}
