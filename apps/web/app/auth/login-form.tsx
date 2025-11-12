"use client";

import { Button, Input, Label } from '@cronkwater/ui';
import { motion } from 'framer-motion';
import { Loader2, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';

const callbackUrl = '/projects';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [isMagicLinkSubmitting, setIsMagicLinkSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setFeedback({ variant: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setIsMagicLinkSubmitting(true);
    setFeedback(null);

    try {
      const response = await signIn('email', {
        email,
        callbackUrl,
        redirect: false
      });

      if (response?.error) {
        setFeedback({ variant: 'error', message: response.error });
        return;
      }

      setFeedback({
        variant: 'success',
        message: 'Check your inbox for a secure magic link from CronkWater.'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not send the magic link right now.';
      setFeedback({ variant: 'error', message });
    } finally {
      setIsMagicLinkSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleSubmitting(true);
    setFeedback(null);

    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in is currently unavailable.';
      setFeedback({ variant: 'error', message });
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
      className="space-y-8"
    >
      <motion.div
        className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-muted-foreground"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Sparkles className="h-4 w-4 text-brand-primary" aria-hidden="true" />
        <span>Supabase-secured access</span>
      </motion.div>

      <motion.form
        onSubmit={handleMagicLink}
        className="space-y-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.2 }}
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-foreground">
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@label.co"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="h-12 rounded-2xl border-border/70 bg-surface/70 px-4 text-base shadow-inner focus-visible:ring-brand-primary"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          variant="solid"
          leadingIcon={isMagicLinkSubmitting ? Loader2 : Mail}
          iconClassName={isMagicLinkSubmitting ? 'animate-spin' : undefined}
          className="w-full rounded-2xl text-base"
          disabled={isMagicLinkSubmitting || isGoogleSubmitting}
        >
          {isMagicLinkSubmitting ? 'Sending magic link…' : 'Email me a magic link'}
        </Button>
      </motion.form>

      <motion.div
        className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <span className="h-px flex-1 bg-border/60" aria-hidden="true" />
        or continue
        <span className="h-px flex-1 bg-border/60" aria-hidden="true" />
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.35, ease: 'easeOut' }}
      >
        <Button
          type="button"
          variant="outline"
          size="lg"
          trailingIcon={isGoogleSubmitting ? undefined : ArrowRight}
          onClick={handleGoogleSignIn}
          className="w-full rounded-2xl text-base"
          disabled={isMagicLinkSubmitting || isGoogleSubmitting}
        >
          {isGoogleSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Connecting to Google…
            </span>
          ) : (
            'Continue with Google'
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-surface/50 px-4 py-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-brand-primary" aria-hidden="true" />
          <span>Authentication is powered by Supabase Auth with enterprise-grade encryption.</span>
        </div>
      </motion.div>

      {feedback && (
        <motion.div
          role="status"
          aria-live="polite"
          className={
            feedback.variant === 'success'
              ? 'rounded-2xl border border-success/60 bg-success/10 px-4 py-3 text-sm text-success-foreground'
              : 'rounded-2xl border border-danger/60 bg-danger/10 px-4 py-3 text-sm text-danger-foreground'
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {feedback.message}
        </motion.div>
      )}
    </motion.div>
  );
}
