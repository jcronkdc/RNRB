'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

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
        text: 'Check your email! We sent you a magic link to sign in.'
      });
      setEmail('');
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send magic link. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);

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
        text: error.message || 'Google sign-in failed. Please try email instead.'
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#050816] via-[#061125] to-[#0f172a] px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Sign in to Rock N' Roll Basement
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Connect your account to start building your music empire
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            <p className={`text-sm ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Email Magic Link - PRIMARY METHOD */}
          <form onSubmit={handleEmailSignIn}>
            <div className="space-y-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-3">
                <p className="text-sm text-purple-400 font-medium">✨ Recommended: Email Magic Link</p>
                <p className="text-xs text-gray-400 mt-1">
                  Powered by Supabase + Resend. Just enter your email - no password needed!
                </p>
              </div>
              
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Sending Magic Link...' : '✉️ Send Magic Link to My Email'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Check your inbox after clicking above!
              </p>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#061125] px-2 text-gray-400">or</span>
            </div>
          </div>

          {/* Google OAuth - Secondary */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-gray-100 disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Loading...' : 'Continue with Google'}
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-purple-400 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-purple-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
