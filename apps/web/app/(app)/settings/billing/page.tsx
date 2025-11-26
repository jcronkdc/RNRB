import { redirect } from 'next/navigation';

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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-gray-400">Manage your subscription plan and billing information</p>
      </div>

      <BillingDashboard subscription={subscription} />
    </div>
  );
}












