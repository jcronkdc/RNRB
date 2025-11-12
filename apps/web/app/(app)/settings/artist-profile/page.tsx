import { redirect } from 'next/navigation';
import { requireOrgSession } from '@songforge/auth';
import { prisma } from '@songforge/db';
import { ArtistProfileForm } from './ArtistProfileForm';

export const dynamic = 'force-dynamic';

export default async function ArtistProfilePage() {
  const session = await requireOrgSession();
  const { orgId, role } = session.activeMembership!;
  
  if (role !== 'owner' && role !== 'admin') {
    redirect('/settings');
  }

  const org = await prisma.org.findUnique({
    where: { id: orgId },
    include: {
      bandMembers: {
        orderBy: { order: 'asc' },
      },
      awards: {
        orderBy: { year: 'desc' },
      },
    },
  });

  if (!org) {
    redirect('/settings');
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Artist Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your public artist profile, EPK, and press materials
        </p>
      </div>

      <ArtistProfileForm org={org} />
    </div>
  );
}

