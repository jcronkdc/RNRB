'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    async function verifyToken() {
      if (!token || !email) {
        setError('Invalid reset link. Please request a new password reset.');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch('https://rnrb.pro/api/email/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            token,
            action: 'verify',
          }),
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setError(data.error || 'This reset link is invalid or has expired.');
        }
      } catch {
        setError('Failed to verify reset link. Please try again.');
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://rnrb.pro/api/email/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          newPassword,
          action: 'reset',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" style={{ color: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Verifying reset link...
        </p>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid && !success) {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          <XCircle className="h-6 w-6" style={{ color: 'var(--error)' }} />
        </div>
        <h1 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text)' }}>
          Link expired or invalid
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          {error || 'This password reset link is no longer valid.'}
        </p>
        <Link href="/forgot-password" className="btn btn-primary w-full py-2.5">
          Request new reset link
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
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
          Your password has been changed successfully.
        </p>
        <Link href="/login" className="btn btn-primary w-full py-2.5">
          Sign in
        </Link>
      </div>
    );
  }

  // Reset form
  return (
    <>
      <h1 className="mb-2 text-center text-lg font-semibold" style={{ color: 'var(--text)' }}>
        Create new password
      </h1>
      <p className="mb-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        For {email}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              autoFocus
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
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            8+ characters, uppercase, lowercase, and number
          </p>
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
  );
}

export default function ResetPasswordPage() {
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
          <Suspense
            fallback={
              <div className="text-center">
                <Loader2
                  className="mx-auto mb-4 h-8 w-8 animate-spin"
                  style={{ color: 'var(--accent)' }}
                />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Loading...
                </p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
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
