'use client';

import { motion } from 'framer-motion';
import { 
  CreditCard,
  Sparkles,
  Music2,
  FileText,
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { Card, Button } from '@cronkwaters/ui';

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-primary/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="rnrb-container max-w-7xl relative z-10 py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Features</p>
                <h1 className="text-3xl md:text-4xl font-display font-bold">Credits & Billing</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Credits power AI features like music generation and songwriting assistance
            </p>
          </motion.div>
        </div>
      </div>

      <div className="rnrb-container max-w-4xl py-12 px-4 space-y-8">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8 rnrb-card">
            <h2 className="text-2xl font-display font-bold mb-4">Your Current Plan</h2>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-2xl font-bold">Free Plan</p>
                <p className="text-sm text-muted-foreground">Perfect for getting started</p>
              </div>
              <Link href="/pricing">
                <Button className="rnrb-button-primary px-6 py-2.5 rounded-xl font-semibold">
                  Upgrade Plan
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
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
          <Card className="p-8 rnrb-card">
            <h2 className="text-2xl font-display font-bold mb-6">What Uses Credits?</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-brand-primary/10">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="font-medium">AI Music Generation</p>
                    <p className="text-sm text-muted-foreground">Create full tracks with AI</p>
                  </div>
                </div>
                <span className="font-semibold">10 credits</span>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-500/10">
                    <Music2 className="w-5 h-5 text-pink-400" />
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
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10">
                    <FileText className="w-5 h-5 text-purple-400" />
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
          <Card className="p-6 rnrb-card bg-blue-500/5 border-blue-500/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
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
          <p className="text-muted-foreground mb-4">
            Ready to unlock more AI features?
          </p>
          <Link href="/pricing">
            <Button className="rnrb-button-primary px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
              View Upgrade Options
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}