import { redirect } from 'next/navigation';
import { CreditCard, Sparkles } from 'lucide-react';

import { BillingDashboard } from './BillingDashboard';

import { getUserSubscription } from '@/lib/actions/subscriptions';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect('/auth');
  }

  const subscription = await getUserSubscription();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-green-500/20 blur-[100px]" />
        <div
          className="absolute -right-32 top-1/4 h-80 w-80 animate-pulse rounded-full bg-cyan-500/15 blur-[100px]"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-pulse rounded-full bg-purple-500/10 blur-[100px]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Hero Section */}
      <div className="relative z-10 border-b border-white/10 bg-gradient-to-r from-green-900/20 via-black to-cyan-900/20">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Gradient accent bar */}
          <div className="mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500" />

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 backdrop-blur-sm">
              <CreditCard className="h-7 w-7 text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                  Billing & Subscription
                </h1>
                <Sparkles className="h-5 w-5 text-green-400" />
              </div>
              <p className="mt-1 text-gray-400">
                Manage your subscription plan and billing information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <BillingDashboard subscription={subscription} />
      </div>
    </div>
  );
}
