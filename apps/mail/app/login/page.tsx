'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    // Ensure email has @rnrb.me domain
    let fullEmail = email;
    if (!email.includes('@')) {
      fullEmail = `${email}@rnrb.me`;
    } else if (!email.endsWith('@rnrb.me')) {
      setError('Only @rnrb.me email addresses are supported');
      setIsLoggingIn(false);
      return;
    }

    try {
      const success = await login(fullEmail, password);
      if (success) {
        router.push('/');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div
      className="transition-theme flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background pattern - subtle */}
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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Secure email for musicians
          </p>
        </div>

        {/* Login form */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <h1 className="mb-6 text-center text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Sign in to your account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@rnrb.me"
                  className="input pl-10"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="rounded-md px-3 py-2 text-sm"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoggingIn || !email || !password}
              className="btn btn-primary w-full py-2.5 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 text-center">
            <Link
              href="/forgot-password"
              className="text-sm transition-colors hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Create account link */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <a
              href="https://rnrb.pro/settings/email"
              className="font-medium transition-colors hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Get your @rnrb.me email
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Part of the{' '}
            <a
              href="https://rnrb.pro"
              className="transition-colors hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Rock N&apos; Roll Basement
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
