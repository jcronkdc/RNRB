import { NavBar } from '@/components/NavBar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { AblyProvider } from '@/components/ably';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AblyProvider>
      <div className="min-h-screen bg-background">
        <NavBar />
        <Breadcrumbs />
        <main>
          {children}
        </main>
      </div>
    </AblyProvider>
  );
}

