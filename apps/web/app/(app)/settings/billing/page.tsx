import { redirect } from 'next/navigation';
import { getUserSubscription } from '@/lib/actions/subscriptions';
import { getCurrentUser } from '@/lib/supabase';
import { BillingDashboard } from './BillingDashboard';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth');
  }

  const subscription = await getUserSubscription();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-400">
          Manage your subscription plan and billing information
        </p>
      </div>

      <BillingDashboard subscription={subscription} />
    </div>
  );
}

