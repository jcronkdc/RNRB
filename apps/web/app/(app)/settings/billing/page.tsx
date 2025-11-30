import { CreditCard } from 'lucide-react';
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Hero Section */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--panel)' }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Accent bar */}
          <div
            style={{
              marginBottom: '24px',
              height: '4px',
              width: '48px',
              borderRadius: '2px',
              backgroundColor: 'var(--accent)',
            }}
          />

          <div className="flex items-center gap-4">
            <div
              style={{
                display: 'flex',
                height: '56px',
                width: '56px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <CreditCard style={{ height: '28px', width: '28px', color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text)' }}>
                Billing & Subscription
              </h1>
              <p style={{ marginTop: '4px', color: 'var(--muted)' }}>
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
