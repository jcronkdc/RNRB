'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Sparkles, ArrowRight, Shield, Zap, CheckCircle } from 'lucide-react';
import Image from 'next/image';

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
    <div className="min-h-screen bg-background">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <Link href="/" className="inline-block mb-8">
              <div className="text-3xl font-display font-bold">
                Rock N' Roll Basement
              </div>
            </Link>

            <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
              Your Music.
              <br />
              <span className="text-brand-primary">Your Studio.</span>
              <br />
              Your Empire.
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Professional collaboration platform for musicians.
              Real-time chat, HD video, AI assistance - all in one place.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Real-Time Collaboration</p>
                  <p className="text-sm text-muted-foreground">
                    Chat, video, and screen sharing with your entire team
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Private by Default</p>
                  <p className="text-sm text-muted-foreground">
                    Invite-only projects keep your work secure
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold mb-1">AI-Powered Tools</p>
                  <p className="text-sm text-muted-foreground">
                    Get chord suggestions, lyrics help, and creative assistance
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rnrb-card p-8 lg:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-8">
                <Link href="/" className="inline-block">
                  <div className="text-2xl font-display font-bold">
                    Rock N' Roll Basement
                  </div>
                </Link>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl font-display font-bold mb-2">
                  Welcome Back
                </h2>
                <p className="text-muted-foreground">
                  Sign in to access your creative workspace
                </p>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-xl border ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <p className={`text-sm ${
                    message.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {message.text}
                  </p>
                </motion.div>
              )}

              <div className="space-y-6">
                {/* Email Magic Link Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none disabled:opacity-50 transition-all"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      No password needed - we'll email you a magic link
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rnrb-button-primary px-6 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending Magic Link...
                      </>
                    ) : (
                      <>
                        Send Magic Link
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-zinc-900 px-3 text-muted-foreground uppercase tracking-wider text-xs">
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Google OAuth */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full rnrb-button-secondary px-6 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-center text-xs text-muted-foreground">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-brand-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-brand-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                New to Rock N' Roll Basement?{' '}
                <Link href="/" className="text-brand-primary hover:underline font-medium">
                  Learn more about the platform
                </Link>
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
