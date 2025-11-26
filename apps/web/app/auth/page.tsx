'use client';

import { motion } from 'framer-motion';
import { Music, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';

import { signInWithCredentials } from '@/app/actions/auth';

const NEXT_REDIRECT = 'NEXT_REDIRECT';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if this is signup flow
  const isSignup = searchParams.get('signup') === 'true';
  const errorParam = searchParams.get('error');

  // Show error from URL params (e.g., from callback)
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
        // Registration
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

        // Auto sign-in after registration
        setTimeout(async () => {
          try {
            const result = await signInWithCredentials({ email, password });
            if (result && !result.success) {
              throw new Error(result.error || 'Auto sign-in failed');
            }
          } catch (error: unknown) {
            // Check if this is a redirect error (success case)
            if (error && typeof error === 'object' && 'digest' in error) {
              const err = error as { digest?: string };
              if (err.digest?.startsWith(NEXT_REDIRECT)) {
                return;
              }
            }
            console.error('[AUTH] Sign-in error:', error);
            throw error;
          }
        }, 1000);
      } else {
        // Sign in using server action
        try {
          const result = await signInWithCredentials({ email, password });
          if (result && !result.success) {
            throw new Error(result.error || 'Sign in failed');
          }
        } catch (error: unknown) {
          // Check if this is a redirect error (success case)
          if (error && typeof error === 'object' && 'digest' in error) {
            const err = error as { digest?: string };
            if (err.digest?.startsWith(NEXT_REDIRECT)) {
              return;
            }
          }
          throw error;
        }
      }
    } catch (error) {
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
    <div className="flex min-h-screen bg-black">
      {/* LEFT SIDE - BRANDING (Hidden on mobile, shown on desktop) */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-red-600" />

        {/* Animated Overlay Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 h-full w-full bg-[url('/noise.png')] opacity-50" />
          <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-white/10 blur-3xl delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative h-32 w-32 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-sm">
                <Image
                  src="/rnrdark.png"
                  alt="Rock N' Roll Basement Logo"
                  width={128}
                  height={128}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-6xl font-black tracking-tight">
              ROCK N' ROLL
              <br />
              BASEMENT
            </h1>

            <p className="mb-4 text-2xl font-semibold text-orange-100">
              {isSignup
                ? 'Your Music Creation Journey Starts Here'
                : 'Where Your Music Finds Its Voice'}
            </p>

            <div className="mt-12 flex items-center justify-center gap-8 text-white/80">
              <div className="text-center">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm">Participants</div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold">HD</div>
                <div className="text-sm">Video Calls</div>
              </div>
              <div className="h-12 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold">AI</div>
                <div className="text-sm">Powered</div>
              </div>
            </div>

            <div className="mx-auto mt-12 max-w-md space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Music className="h-4 w-4" />
                </div>
                <span className="text-white/90">
                  {isSignup
                    ? 'Start creating with AI-powered songwriting tools'
                    : 'Real-time collaboration with your band'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-white/90">
                  {isSignup
                    ? 'Collaborate with musicians worldwide'
                    : 'AI-powered songwriting tools'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Music className="h-4 w-4" />
                </div>
                <span className="text-white/90">
                  {isSignup
                    ? 'Invite-only private projects for your work'
                    : 'Invite-only private projects'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-xl bg-orange-500/10 p-4 backdrop-blur-sm">
              <Image
                src="/rnrdark.png"
                alt="Rock N' Roll Basement Logo"
                width={80}
                height={80}
                className="h-full w-full object-contain brightness-0 invert"
                priority
              />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">ROCK N' ROLL BASEMENT</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="mb-2 text-4xl font-bold text-white">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400">
              {isSignup
                ? 'Sign up to start building your music empire'
                : 'Sign in to continue building your music empire'}
            </p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-4 ${
                message.type === 'success'
                  ? 'border-green-500/30 bg-green-500/10'
                  : 'border-red-500/30 bg-red-500/10'
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {message.text}
              </p>
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Signup Context Message */}
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-green-500/30 bg-green-500/10 p-4"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-green-300">
                  🎸 Free Plan Included
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Start with 3 projects, 1 collaborator, and all basic tools. Upgrade anytime!
                </p>
              </motion.div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handlePasswordAuth} className="space-y-4">
              {isSignup && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name (optional)"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
                />
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 8 characters)"
                required
                minLength={8}
                disabled={loading}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full transform rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] hover:bg-orange-600 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSignup ? 'Creating Account...' : 'Signing In...'}
                  </span>
                ) : isSignup ? (
                  '🚀 Create Account'
                ) : (
                  '🎸 Sign In'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Link
                  href={isSignup ? '/auth' : '/auth?signup=true'}
                  className="font-medium text-orange-500 hover:text-orange-400 hover:underline"
                >
                  {isSignup ? 'Sign in' : 'Create one'}
                </Link>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <Link
              href="/terms"
              className="text-orange-500 transition-colors hover:text-orange-400 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-orange-500 transition-colors hover:text-orange-400 hover:underline"
            >
              Privacy Policy
            </Link>
            .
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
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
