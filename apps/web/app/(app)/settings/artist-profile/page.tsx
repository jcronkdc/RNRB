import { redirect } from 'next/navigation';
import { getOrgSession } from '@songforge/auth';
import { prisma } from '@songforge/db';
import { ArtistProfileForm } from './ArtistProfileForm';

export const dynamic = 'force-dynamic';

export default async function ArtistProfilePage() {
  const session = await getOrgSession();
  
  if (!session) {
    redirect('/auth');
  }

  const membership = session.activeMembership;
  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    redirect('/settings');
  }

  const org = await prisma.org.findUnique({
    where: { id: membership.orgId },
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

