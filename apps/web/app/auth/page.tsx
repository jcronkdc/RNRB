'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

import { signInWithCredentials } from '@/app/actions/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

function AuthForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isSignup = searchParams.get('signup') === 'true';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        Configuration: 'Server configuration error. Please try again later.',
        AccessDenied: 'Access denied. Please try again.',
        Verification: 'Verification failed. Please try again.',
        CredentialsSignin: 'Invalid email or password. Please try again.',
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

        setMessage({
          type: 'success',
          text: 'Account created! Signing you in...',
        });

        // Auto sign-in immediately (no setTimeout to avoid async boundary issues)
        const result = await signInWithCredentials({ email, password });
        if (result && !result.success) {
          throw new Error(result.error || 'Auto sign-in failed. Please sign in manually.');
        }
        // If successful, redirect will happen automatically (via thrown redirect error)
      } else {
        // Sign in flow
        const result = await signInWithCredentials({ email, password });
        if (result && !result.success) {
          throw new Error(result.error || 'Sign in failed');
        }
        // If successful, redirect will happen automatically (via thrown redirect error)
      }
    } catch (error) {
      // Redirect errors are successful auth - silently return to allow server redirect
      if (isRedirectError(error)) {
        // Keep loading state active during redirect to prevent UI flash
        // The page will be unmounted during navigation, so no need to reset
        return; // Don't re-throw; let Next.js handle the server-side redirect
      }

      // Handle actual errors
      console.error('[AUTH] Password auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setMessage({
        type: 'error',
        text: errorMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-zinc-950">
      {/* Full-screen animated background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

        {/* Accent glow - top left */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-orange-600/20 blur-[120px]"
        />

        {/* Accent glow - bottom right */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-red-600/15 blur-[150px]"
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* LEFT SIDE - HERO BRANDING */}
      <div className="relative z-10 hidden w-1/2 flex-col items-center justify-center p-16 lg:flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* MASSIVE LOGO - No container, no background */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mb-8"
          >
            {/* Glow behind logo */}
            <div className="absolute inset-0 scale-110 blur-3xl">
              <Image
                src="/rnrdark.png"
                alt=""
                width={320}
                height={320}
                className="h-full w-full object-contain opacity-50"
              />
            </div>

            {/* Main logo */}
            <Image
              src="/rnrdark.png"
              alt="Rock N' Roll Basement"
              width={320}
              height={320}
              className="relative h-64 w-64 object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>

          {/* Brand name - dramatic typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <h1 className="font-black tracking-tight text-white">
              <span className="block text-7xl">ROCK N' ROLL</span>
              <span className="block text-7xl text-orange-500">BASEMENT</span>
            </h1>

            <p className="mt-6 text-xl font-light tracking-wide text-zinc-400">
              Where musicians create together
            </p>
          </motion.div>

          {/* Stats - minimal, clean */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 flex items-center gap-12 text-zinc-500"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-xs uppercase tracking-widest">Participants</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">HD</div>
              <div className="text-xs uppercase tracking-widest">Video</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">AI</div>
              <div className="text-xs uppercase tracking-widest">Powered</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="relative z-10 flex w-full items-center justify-center p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="mb-12 text-center lg:hidden">
            <Image
              src="/rnrdark.png"
              alt="Rock N' Roll Basement"
              width={120}
              height={120}
              className="mx-auto mb-6 h-24 w-24 object-contain"
              priority
            />
            <h1 className="text-3xl font-black tracking-tight text-white">
              ROCK N' ROLL <span className="text-orange-500">BASEMENT</span>
            </h1>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-8 backdrop-blur-xl">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-white">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="mt-2 text-zinc-500">
                {isSignup ? 'Start your music journey' : 'Sign in to continue'}
              </p>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 rounded-lg border p-4 ${
                  message.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </motion.div>
            )}

            {isSignup && (
              <div className="mb-6 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                <p className="text-sm font-medium text-zinc-300">Free Plan Included</p>
                <p className="mt-1 text-xs text-zinc-500">
                  3 projects, 1 collaborator, all basic tools
                </p>
              </div>
            )}

            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name (optional)"
                    disabled={loading}
                    className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white transition-all placeholder:text-zinc-600 focus:border-orange-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white transition-all placeholder:text-zinc-600 focus:border-orange-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white transition-all placeholder:text-zinc-600 focus:border-orange-500/50 focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/40 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : isSignup ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="pt-4 text-center text-sm text-zinc-500">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Link
                  href={isSignup ? '/auth' : '/auth?signup=true'}
                  className="font-medium text-orange-500 transition-colors hover:text-orange-400"
                >
                  {isSignup ? 'Sign in' : 'Create one'}
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-600">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-zinc-500 hover:text-zinc-400">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-zinc-500 hover:text-zinc-400">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
