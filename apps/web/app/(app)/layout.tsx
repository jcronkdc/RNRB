import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth');
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10">
      {children}
    </section>
  );
}

