"use client";

import { Button, Input, Label } from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Loader2, Mail, Sparkles, ArrowRight, UserPlus } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const callbackUrl = '/onboarding/organization';

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'error'; message: string } | null>(null);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !name.trim()) {
      setFeedback({ variant: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      // For NextAuth with email provider, signing in with a new email creates an account
      const response = await signIn('email', {
        email,
        callbackUrl,
        redirect: false
      });

      if (response?.error) {
        let errorMessage = response.error;
        if (errorMessage.includes('No provider') || errorMessage.includes('EMAIL_SERVER') || errorMessage.includes('email authentication is not configured')) {
          errorMessage = 'Email authentication is not yet configured. Please use Google sign-in for now, or contact support to enable email authentication.';
        }
        setFeedback({ variant: 'error', message: errorMessage });
        return;
      }

      setFeedback({
        variant: 'success',
        message: 'Check your email to complete signup! We sent a magic link to verify your account.'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create account. Please try again.';
      setFeedback({ variant: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await signIn('google', { 
        callbackUrl,
        redirect: false 
      });
      
      if (response?.error) {
        let errorMessage = response.error;
        if (errorMessage.includes('Configuration') || errorMessage.includes('CLIENT_ID')) {
          errorMessage = 'Google sign-up is not configured. Please use email or contact support.';
        }
        setFeedback({ variant: 'error', message: errorMessage });
      } else if (response?.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-up is currently unavailable.';
      setFeedback({ variant: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            Your name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Josh Waters"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-2xl"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          variant="solid"
          leadingIcon={isSubmitting ? Loader2 : UserPlus}
          iconClassName={isSubmitting ? 'animate-spin' : undefined}
          className="w-full rounded-2xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating account...' : 'Create free account'}
        </Button>
      </form>

      <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
        <span className="h-px flex-1 bg-border/60" />
        or
        <span className="h-px flex-1 bg-border/60" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleSignUp}
        className="w-full rounded-2xl"
        disabled={isSubmitting}
      >
        Sign up with Google
      </Button>

      {feedback && (
        <motion.div
          className={`rounded-2xl p-4 text-sm ${
            feedback.variant === 'success'
              ? 'bg-success/10 text-success-foreground border border-success/20'
              : 'bg-danger/10 text-danger-foreground border border-danger/20'
          }`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {feedback.message}
        </motion.div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          onClick={() => router.push('/auth')}
          className="text-brand-primary hover:underline"
          type="button"
        >
          Sign in
        </button>
      </p>
    </motion.div>
  );
}

