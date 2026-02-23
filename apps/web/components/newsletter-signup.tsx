'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsletterSignupProps {
  variant?: 'default' | 'minimal' | 'inline' | 'hero';
  source?: string;
  className?: string;
}

// Custom icons (no emojis)
const IconMail = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconMusic = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const IconSparkle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const IconRocket = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const IconMic = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const IconLightbulb = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

export function NewsletterSignup({
  variant = 'default',
  source = 'website',
  className = '',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Check your email to confirm!');
        setEmail('');
        setFirstName('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Connection error. Please try again.');
    }
  };

  // Minimal inline variant
  if (variant === 'minimal' || variant === 'inline') {
    return (
      <div className={`${className}`}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gold-400 flex items-center gap-2"
            >
              <IconCheck />
              <span className="text-sm">{message}</span>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="focus:ring-gold-500/50 focus:border-gold-500 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:ring-2 focus:outline-hidden"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 flex items-center gap-2 rounded-lg bg-linear-to-r px-4 py-2 text-sm font-medium text-black transition-all disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="animate-spin">⚙</span>
                ) : (
                  <>
                    <IconMail />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {status === 'error' && <p className="mt-2 text-xs text-red-400">{message}</p>}
      </div>
    );
  }

  // Hero variant - larger, more prominent
  if (variant === 'hero') {
    return (
      <div className={`mx-auto max-w-2xl ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-linear-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90 p-8 md:p-10"
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="bg-gold-500/10 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />
            <div className="bg-gold-500/5 absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="mb-8 text-center">
              <div className="bg-gold-500/10 border-gold-500/20 text-gold-400 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                <IconMusic />
                <span>Join 10,000+ musicians</span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">Stay in the Loop</h3>
              <p className="mx-auto max-w-md text-zinc-400">
                Get exclusive tips, early access to new features, and inspiration delivered straight
                to your inbox.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-8 text-center"
                >
                  <div className="bg-gold-500/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <IconCheck />
                  </div>
                  <h4 className="mb-2 text-xl font-semibold text-white">You&apos;re Almost In!</h4>
                  <p className="text-zinc-400">{message}</p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name (optional)"
                      className="focus:ring-gold-500/50 focus:border-gold-500 flex-1 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-white transition-all placeholder:text-zinc-500 focus:ring-2 focus:outline-hidden"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="focus:ring-gold-500/50 focus:border-gold-500 flex-1 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-white transition-all placeholder:text-zinc-500 focus:ring-2 focus:outline-hidden"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 shadow-gold-500/20 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r py-3 font-semibold text-black shadow-lg transition-all disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block"
                        >
                          <IconMail />
                        </motion.span>
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <IconMail />
                        <span>Subscribe to Newsletter</span>
                      </>
                    )}
                  </button>
                  {status === 'error' && (
                    <p className="text-center text-sm text-red-400">{message}</p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            {/* Benefits */}
            <div className="mt-8 border-t border-zinc-800/50 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center text-xs md:grid-cols-4">
                <div className="flex flex-col items-center gap-1 text-zinc-500">
                  <IconRocket />
                  <span>Product updates</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-zinc-500">
                  <IconLightbulb />
                  <span>Tips & tricks</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-zinc-500">
                  <IconMic />
                  <span>Community events</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-zinc-500">
                  <IconSparkle />
                  <span>Early access</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-zinc-600">
              No spam, unsubscribe anytime. We respect your inbox.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-gold-500/10 text-gold-400 flex h-10 w-10 items-center justify-center rounded-lg">
          <IconMail />
        </div>
        <div>
          <h4 className="font-semibold text-white">Newsletter</h4>
          <p className="text-xs text-zinc-500">Get updates & tips</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-green-400"
          >
            <IconCheck />
            <span className="text-sm">{message}</span>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="focus:ring-gold-500/50 focus:border-gold-500 w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-2.5 text-sm text-white transition-all placeholder:text-zinc-500 focus:ring-2 focus:outline-hidden"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 w-full rounded-lg bg-linear-to-r py-2.5 text-sm font-medium text-black transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
            {status === 'error' && <p className="text-xs text-red-400">{message}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NewsletterSignup;
