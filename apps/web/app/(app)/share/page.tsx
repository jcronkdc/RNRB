'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { SocialShareHub } from '@/components/social-share/social-share-hub';
import { PageSkeleton } from '@/components/loading-skeletons';

function ShareContent() {
  return <SocialShareHub />;
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
          <div className="px-4 py-8">
            <div className="mx-auto max-w-4xl">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <Link href="/">
                  <Image
                    src="/logo-dark.png"
                    alt="Rock N' Roll Basement"
                    width={140}
                    height={56}
                    className="transition-opacity hover:opacity-80"
                  />
                </Link>
              </div>
              <PageSkeleton title={true} stats={false} content="list" />
            </div>
          </div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
