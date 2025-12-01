'use client';

import { Suspense } from 'react';

import { SocialShareHub } from '@/components/social-share/social-share-hub';

function ShareContent() {
  return <SocialShareHub />;
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: 'var(--bg)' }}
        >
          <div className="animate-pulse text-[color:var(--muted)]">Loading share hub...</div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
