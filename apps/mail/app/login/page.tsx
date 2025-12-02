'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Mail, Lock, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rnrb-black via-rnrb-dark to-rnrb-black p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/2 -top-1/2 h-full w-full rounded-full bg-gradient-to-br from-rnrb-orange/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-tl from-rnrb-purple/10 to-transparent blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          {/* RNRB Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Image
              src="/logo-dark.png"
              alt="Rock N' Roll Basement"
              width={200}
              height={70}
              className="mx-auto"
              priority
            />
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-white">RNRB Mail</h1>
          <p className="mt-2 text-rnrb-muted">Email for musicians</p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-rnrb-border bg-rnrb-panel/80 p-8 backdrop-blur-xl"
          style={{ boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)' }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-400"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-rnrb-text">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rnrb-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@rnrb.me"
                  required
                  className="w-full rounded-xl border border-rnrb-border bg-rnrb-black py-3 pl-12 pr-4 text-white placeholder-rnrb-muted transition-all focus:border-rnrb-orange focus:outline-none focus:ring-2 focus:ring-rnrb-orange/20"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-rnrb-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rnrb-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-rnrb-border bg-rnrb-black py-3 pl-12 pr-4 text-white placeholder-rnrb-muted transition-all focus:border-rnrb-orange focus:outline-none focus:ring-2 focus:ring-rnrb-orange/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-rnrb-orange to-amber-500 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-rnrb-orange/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-rnrb-muted">
              Don&apos;t have an account?{' '}
              <a
                href="https://rnrb.pro/settings/email"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rnrb-orange hover:underline"
              >
                Create one at RNRB
              </a>
            </p>
          </div>
        </motion.form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-rnrb-muted">
          Works with any @rnrb.me, @rnrb.band, or @rnrb.app email
        </p>
      </motion.div>
    </div>
  );
}
