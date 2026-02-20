'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff } from '@/components/ui/custom-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Suspense, useState, useEffect } from 'react';

// ─── Auth Form ───────────────────────────────────────────────────────────────

function AuthForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = searchParams.get('signup') === 'true';
  const errorParam = searchParams.get('error');
  // Middleware sends ?from=, direct links use ?redirect= — support both
  const redirectParam = searchParams.get('redirect') || searchParams.get('from') || null;
  const forgotPasswordHref = `/auth/reset${
    redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''
  }`;

  const sanitizeRedirect = (value?: string | null) => {
    if (!value) return '/dashboard';
    if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard';
    return value;
  };

  const buildPostAuthRedirect = (isNewUser: boolean) => {
    const target = sanitizeRedirect(redirectParam);
    if (isNewUser) {
      if (target !== '/dashboard') {
        return `/settings/profile?setup=true&redirect=${encodeURIComponent(target)}`;
      }
      return '/settings/profile?setup=true';
    }
    return target;
  };

  const completeCredentialsSignIn = async (isNewUser: boolean) => {
    const redirectTarget = buildPostAuthRedirect(isNewUser);
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      redirectTo: redirectTarget,
    });

    if (!result) throw new Error('Sign in failed');

    if (result.error) {
      if (result.error === 'CredentialsSignin' || result.error === 'CallbackRouteError') {
        throw new Error('Invalid email or password');
      }
      throw new Error(result.error);
    }

    if (result.url) {
      window.location.href = result.url;
      return;
    }

    window.location.href = redirectTarget;
  };

  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        Configuration: 'Server configuration error. Please try again later.',
        AccessDenied: 'Access denied. Please try again.',
        Verification: 'Verification failed. Please try again.',
        CredentialsSignin: 'Invalid email or password. Please try again.',
        CallbackRouteError: 'Invalid email or password. Please try again.',
        OAuthAccountNotLinked: 'This email is already associated with another sign-in method.',
        Default: 'An error occurred during sign-in. Please try again.',
      };
      setMessage({
        type: 'error',
        text: errorMessages[errorParam] || errorMessages.Default,
      });
    }
  }, [errorParam]);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignup) {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registration failed');
        }

        setMessage({ type: 'success', text: 'Account created! Signing you in...' });
        await completeCredentialsSignIn(true);
      } else {
        await completeCredentialsSignIn(false);
      }
    } catch (error) {
      console.error('[AUTH] Password auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setMessage({ type: 'error', text: errorMessage });
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50';

  return (
    <div className="relative flex min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, var(--accent-muted) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Left — Branding (desktop) */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center p-16 lg:flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="flex flex-col items-center text-center"
        >
          {/* Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 scale-125 blur-3xl opacity-30">
              <Image src="/rnrdark.png" alt="" width={280} height={280} className="h-full w-full object-contain" />
            </div>
            <Image
              src="/rnrdark.png"
              alt="Rock N' Roll Basement"
              width={280}
              height={280}
              className="relative h-52 w-52 object-contain"
              priority
            />
          </div>

          <h1 className="text-5xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
            ROCK N&apos; ROLL
          </h1>
          <h1 className="text-5xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>
            BASEMENT
          </h1>

          <p className="mt-6 text-lg font-light" style={{ color: 'var(--muted)' }}>
            Where musicians create together
          </p>

          {/* Stats */}
          <div
            className="mt-14 flex items-center gap-10"
            style={{ color: 'var(--muted-soft)' }}
          >
            {[
              { value: '50+', label: 'Participants' },
              { value: 'HD', label: 'Video' },
              { value: 'AI', label: 'Powered' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-10">
                {i > 0 && <div className="h-8 w-px" style={{ background: 'var(--border)' }} />}
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 sm:p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="mb-10 text-center lg:hidden">
            <Image
              src="/rnrdark.png"
              alt="Rock N' Roll Basement"
              width={100}
              height={100}
              className="mx-auto mb-4 h-20 w-20 object-contain"
              priority
            />
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              ROCK N&apos; ROLL <span style={{ color: 'var(--accent)' }}>BASEMENT</span>
            </h1>
          </div>

          {/* Form card */}
          <div
            className="rounded-xl border p-7 sm:p-8"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="mb-7 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignup ? 'signup' : 'signin'}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                    {isSignup ? 'Create account' : 'Welcome back'}
                  </h2>
                  <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>
                    {isSignup ? 'Start your music journey' : 'Sign in to continue'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className={`mb-5 overflow-hidden rounded-lg border p-3.5 ${
                    message.type === 'success'
                      ? 'border-[var(--sage)]/30 bg-[var(--sage-muted)]'
                      : 'border-red-500/30 bg-red-500/10'
                  }`}
                >
                  <p
                    className="text-sm"
                    style={{ color: message.type === 'success' ? 'var(--sage)' : '#ef4444' }}
                  >
                    {message.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Free plan badge on signup */}
            {isSignup && (
              <div
                className="mb-5 rounded-lg border p-3.5"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Free plan included
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                  3 projects, 1 collaborator, all basic tools
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {isSignup && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="mb-1.5 block text-xs font-medium"
                    style={{ color: 'var(--muted)' }}
                  >
                    Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    disabled={loading}
                    className={inputClass}
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className={inputClass}
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="auth-password"
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--muted)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    disabled={loading}
                    className={`${inputClass} pr-12`}
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-white/5"
                    style={{ color: 'var(--muted)' }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {!isSignup && (
                <div className="flex justify-end">
                  <Link
                    href={forgotPasswordHref}
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent)' }}
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'var(--accent)',
                  boxShadow: '0 4px 16px var(--accent-glow)',
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSignup ? 'Creating account...' : 'Signing in...'}
                  </span>
                ) : isSignup ? (
                  'Create account'
                ) : (
                  'Sign in'
                )}
              </button>

              <p className="pt-3 text-center text-sm" style={{ color: 'var(--muted)' }}>
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Link
                  href={
                    isSignup
                      ? `/auth${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ''}`
                      : `/auth?signup=true${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ''}`
                  }
                  className="font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--accent)' }}
                >
                  {isSignup ? 'Sign in' : 'Create one'}
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: 'var(--muted-soft)' }}>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="transition-colors hover:text-[var(--muted)]" style={{ color: 'var(--muted-soft)' }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="transition-colors hover:text-[var(--muted)]" style={{ color: 'var(--muted-soft)' }}>
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <div
            className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
