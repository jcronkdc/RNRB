import { auth } from '@cronkwaters/auth';
import { redirect } from 'next/navigation';
import { AppShell } from './app-shell';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth');
  }

  return <AppShell>{children}</AppShell>;
}