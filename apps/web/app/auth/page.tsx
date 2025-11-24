'use client';

import { motion } from 'framer-motion';
import { Music, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState , Suspense } from 'react';

import { supabase } from '@/lib/supabase';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if this is signup flow
  const isSignup = searchParams.get('signup') === 'true';

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Check if Supabase is initialized
    if (!supabase) {
      setMessage({
        type: 'error',
        text: 'Authentication service is not configured. Please contact support.',
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Check your email! We sent you a magic link to sign in.',
      });
      setEmail('');
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send magic link. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);

    // Check if Supabase is initialized
    if (!supabase) {
      setMessage({
        type: 'error',
        text: 'Authentication service is not configured. Please contact support.',
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Google sign-in failed. Please try email instead.',
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

            {/* Title - LOUD AND PROUD */}
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
              {isSignup ? 'Get Started' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400">
              {isSignup
                ? 'Create your account and start building your music empire'
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

            {/* Email Magic Link - PRIMARY METHOD */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                  <Sparkles className="h-4 w-4" />
                  Recommended: Email Magic Link
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Powered by Supabase + Resend. No password needed!
                </p>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-white transition-all placeholder:text-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full transform rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] hover:bg-orange-600 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading
                  ? 'Sending Magic Link...'
                  : isSignup
                    ? '✉️ Send Magic Link to Get Started'
                    : '✉️ Send Magic Link to My Email'}
              </button>

              <p className="text-center text-xs text-gray-500">
                {isSignup
                  ? 'Check your inbox after clicking! No password needed.'
                  : 'Check your inbox after clicking above!'}
              </p>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-3 text-gray-500">or</span>
              </div>
            </div>

            {/* Google OAuth - Secondary */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full transform rounded-xl bg-white px-4 py-3 text-base font-semibold text-gray-900 shadow-lg transition-all hover:scale-[1.02] hover:bg-gray-100 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {loading ? 'Loading...' : 'Continue with Google'}
              </div>
            </button>
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
