'use client';

import { motion } from 'framer-motion';
import { CreditCard, Sparkles, Music2, FileText, Info, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@cronkwaters/ui';

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
        </div>

        <div className="rnrb-container relative z-10 max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
                <CreditCard className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Features</p>
                <h1 className="font-display text-3xl font-bold md:text-4xl">Credits & Billing</h1>
              </div>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Credits power AI features like music generation and songwriting assistance
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-4xl space-y-8 px-4 py-12">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rnrb-card p-8">
            <h2 className="font-display mb-4 text-2xl font-bold">Your Current Plan</h2>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">Free Plan</p>
                <p className="text-sm text-muted-foreground">Perfect for getting started</p>
              </div>
              <Link href="/pricing">
                <Button className="rnrb-button-primary rounded-xl px-6 py-2.5 font-semibold">
                  Upgrade Plan
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Credits Used</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">100</p>
                <p className="text-sm text-muted-foreground">Credits Available</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">100</p>
                <p className="text-sm text-muted-foreground">Monthly Allowance</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* What Uses Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rnrb-card p-8">
            <h2 className="font-display mb-6 text-2xl font-bold">What Uses Credits?</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                    <Sparkles className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium">AI Music Generation</p>
                    <p className="text-sm text-muted-foreground">Create full tracks with AI</p>
                  </div>
                </div>
                <span className="font-semibold">10 credits</span>
              </div>

              <div className="flex items-center justify-between border-b border-border py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                    <Music2 className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="font-medium">Chord Progression AI</p>
                    <p className="text-sm text-muted-foreground">Generate chord progressions</p>
                  </div>
                </div>
                <span className="font-semibold">2 credits</span>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <FileText className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Lyrics Generation</p>
                    <p className="text-sm text-muted-foreground">AI-powered lyrics suggestions</p>
                  </div>
                </div>
                <span className="font-semibold">3 credits</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="rnrb-card border-blue-500/20 bg-blue-500/5 p-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Info className="h-5 w-5 text-blue-400" />
              Good to Know
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Free plan includes 100 credits per month</li>
              <li>• Credits reset on the 1st of each month</li>
              <li>• Unused credits don't roll over</li>
              <li>• Collaboration features don't use credits</li>
              <li>• Upgrade anytime for more credits and features</li>
            </ul>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <p className="mb-4 text-muted-foreground">Ready to unlock more AI features?</p>
          <Link href="/pricing">
            <Button className="rnrb-button-primary inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold">
              View Upgrade Options
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
