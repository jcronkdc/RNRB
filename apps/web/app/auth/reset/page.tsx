'use client';

import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from '@/components/ui/custom-icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

function PasswordResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const redirectParam = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<StatusMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'request' | 'reset'>(token ? 'reset' : 'request');
  const [showPassword, setShowPassword] = useState(false);

  const signInHref = useMemo(
    () => `/auth${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`,
    [redirectParam]
  );
  const requestHref = useMemo(
    () => `/auth/reset${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`,
    [redirectParam]
  );

  useEffect(() => {
    setMode(token ? 'reset' : 'request');
    setMessage(null);
  }, [token]);

  const handleRequestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirect: redirectParam ?? undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to request password reset.');
      }

      const warningSuffix = data?.warning ? ` (${data.warning})` : '';
      setMessage({
        type: 'success',
        text: `${data?.message || 'Check your inbox for the reset link.'}${warningSuffix}`,
      });
      setEmail('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to request password reset.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setMessage({ type: 'error', text: 'Reset token missing. Request a fresh link.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords must match.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to reset password.');
      }

      setMessage({
        type: 'success',
        text: 'Password updated. Redirecting you to sign in...',
      });

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push(signInHref);
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const headline = mode === 'reset' ? 'Choose a new password' : 'Reset your password';
  const subheading =
    mode === 'reset'
      ? 'Set a new password to regain access to your account.'
      : "Enter the email you use for Rock N' Roll Basement and we'll send instructions.";

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-zinc-950">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-24 -top-24 h-[420px] w-[420px] rounded-full bg-orange-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-24 h-[520px] w-[520px] rounded-full bg-red-600/20 blur-[160px]"
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md"
        >
          <div className="2xl rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-8">
            <div className="mb-8 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Account access</p>
              <h1 className="mt-3 text-3xl font-bold text-white">{headline}</h1>
              <p className="mt-3 text-sm text-zinc-500">{subheading}</p>
            </div>

            {message && (
              <div
                className={`mb-6 rounded-lg border p-4 text-sm ${
                  message.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}
              >
                {message.text}
              </div>
            )}

            {mode === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                  >
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white transition-all placeholder:text-zinc-600 focus:border-orange-500/50 focus:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/40 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending link...
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      disabled={loading}
                      className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 pr-12 text-white transition-all placeholder:text-zinc-600 focus:border-orange-500/50 focus:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-700/50 hover:text-zinc-300"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat your new password"
                      required
                      minLength={8}
                      disabled={loading}
                      className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 pr-12 text-white transition-all placeholder:text-zinc-600 focus:border-orange-500/50 focus:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-700/50 hover:text-zinc-300"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-lg bg-linear-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/40 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating password...
                    </span>
                  ) : (
                    'Update password'
                  )}
                </button>

                <p className="text-center text-sm text-zinc-500">
                  Link expired?{' '}
                  <Link
                    href={requestHref}
                    className="font-medium text-orange-500 hover:text-orange-400"
                  >
                    Request a new reset link
                  </Link>
                  .
                </p>
              </form>
            )}

            <p className="mt-10 text-center text-sm text-zinc-500">
              Ready to sign in?{' '}
              <Link
                href={signInHref}
                className="font-semibold text-white transition hover:text-orange-400"
              >
                Return to sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <PasswordResetContent />
    </Suspense>
  );
}
