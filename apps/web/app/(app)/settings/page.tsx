'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile settings
    router.push('/settings/profile');
  }, [router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-lg" style={{ color: 'var(--text)' }}>
        Redirecting to settings...
      </div>
    </div>
  );
}
