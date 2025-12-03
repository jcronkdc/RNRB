'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { WorkspaceProvider, CustomizableDashboard } from '@/components/workspace';

function DashboardContent() {
  useRequireAuth();

  return (
    <WorkspaceProvider>
      <CustomizableDashboard />
    </WorkspaceProvider>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
