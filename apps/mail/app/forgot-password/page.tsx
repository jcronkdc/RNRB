'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // For now, go directly to reset step since we're doing direct reset
      // In production, this would send an email
      setStep('reset');
      setMessage('Enter your new password below.');
    } catch (err) {
      setError((err as Error).message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password
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
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://rnrb.pro/api/email/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStep('success');
    } catch (err) {
      setError((err as Error).message || 'Failed to reset password');
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

          <h1 className="font-display text-2xl font-bold text-white">
            {step === 'success' ? 'Password Reset!' : 'Reset Password'}
          </h1>
          <p className="mt-2 text-rnrb-muted">
            {step === 'email' && 'Enter your email to reset your password'}
            {step === 'reset' && 'Choose a new password'}
            {step === 'success' && 'You can now sign in with your new password'}
          </p>
        </div>

        {/* Success State */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden rounded-2xl border border-green-500/30 bg-rnrb-panel/80 p-8 text-center backdrop-blur-xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Success!</h2>
            <p className="mb-6 text-rnrb-muted">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rnrb-orange to-amber-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Sign In
            </Link>
          </motion.div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleRequestReset}
            className="overflow-hidden rounded-2xl border border-rnrb-border bg-rnrb-panel/80 p-8 backdrop-blur-xl"
          >
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-rnrb-text">
                  Email Address
                </label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-rnrb-orange to-amber-500 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-rnrb-muted hover:text-rnrb-orange"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </motion.form>
        )}

        {/* Reset Step */}
        {step === 'reset' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleResetPassword}
            className="overflow-hidden rounded-2xl border border-rnrb-border bg-rnrb-panel/80 p-8 backdrop-blur-xl"
          >
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-rnrb-orange/10 p-4 text-rnrb-orange">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{message}</p>
              </div>
            )}

            <div className="mb-4 rounded-lg bg-rnrb-black/50 p-3">
              <p className="text-sm text-rnrb-muted">Resetting password for:</p>
              <p className="font-medium text-white">{email}</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-rnrb-text">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rnrb-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="w-full rounded-xl border border-rnrb-border bg-rnrb-black py-3 pl-12 pr-12 text-white placeholder-rnrb-muted transition-all focus:border-rnrb-orange focus:outline-none focus:ring-2 focus:ring-rnrb-orange/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-rnrb-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-rnrb-muted">
                  Must include uppercase, lowercase, and a number
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-rnrb-text">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-rnrb-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full rounded-xl border border-rnrb-border bg-rnrb-black py-3 pl-12 pr-4 text-white placeholder-rnrb-muted transition-all focus:border-rnrb-orange focus:outline-none focus:ring-2 focus:ring-rnrb-orange/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-rnrb-orange to-amber-500 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-2 text-sm text-rnrb-muted hover:text-rnrb-orange"
              >
                <ArrowLeft className="h-4 w-4" />
                Use a different email
              </button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
