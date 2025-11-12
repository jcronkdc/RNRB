import { auth } from '@cronkwaters/auth';
import { motion } from 'framer-motion';
import { redirect } from 'next/navigation';

import LoginForm from './login-form';

export const dynamic = 'force-dynamic';

export default async function AuthPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/projects');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(88,91,255,0.18),_transparent_55%)]" />
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mx-auto w-full max-w-md"
      >
        <motion.div
          className="rounded-3xl border border-border bg-surface/80 p-10 shadow-soft backdrop-blur-xl"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
        >
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back to CronkWaters</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your collaborative studio, AI co-creators, and release pipeline — all powered by Supabase Auth.
            </p>
          </div>
          <div className="mt-10">
            <LoginForm />
          </div>
        </motion.div>
        <motion.p
          className="mt-8 text-center text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          By continuing you agree to the CronkWaters Terms and acknowledge the use of Supabase for secure authentication.
        </motion.p>
      </motion.section>
    </main>
  );
}
