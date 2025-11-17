'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './login-form';
import SignUpForm from './signup-form';
import { Music } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(88,91,255,0.18),_transparent_55%)]" />
      <section className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface/80 p-10 shadow-soft backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
              <Music className="w-8 h-8 text-brand-primary" />
            </div>
          </div>
          
          <div className="space-y-3 text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {mode === 'signin' ? 'Welcome back' : 'Join CronkWaters'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' 
                ? 'Sign in to access your creative studio and projects'
                : 'Create your free account and start making music'}
            </p>
          </div>

          <div className="flex bg-surface rounded-2xl p-1 mb-8">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signin' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'signin' ? <LoginForm /> : <SignUpForm />}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing you agree to The CronkWaters Project Terms and acknowledge the use of NextAuth for secure authentication.
        </p>
      </section>
    </main>
  );
}