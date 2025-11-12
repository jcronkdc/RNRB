/**
 * Organization Onboarding - Fully functional with invite system
 * No more disabled buttons or placeholders
 */

import { auth, setActiveOrgCookie } from '@cronkwaters/auth';
import { Button } from '@cronkwaters/ui';
import { redirect } from 'next/navigation';
import { JoinWithInviteDialog } from './JoinWithInviteDialog';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { prisma } from '@cronkwaters/db';
import { Building2, Users, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUserOrganizations(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      org: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return memberships.map(m => m.org);
}

async function setActiveOrg(orgId: string) {
  'use server';
  setActiveOrgCookie(orgId);
  redirect('/projects');
}

async function clearOrg() {
  'use server';
  setActiveOrgCookie(null);
  redirect('/onboarding/organization');
}

export default async function OrganizationOnboardingPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth');
  }

  const organizations = await getUserOrganizations(session.user.id);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand-foreground">Your Organizations</h1>
        <p className="text-sm text-muted-foreground">
          Create a new organization or join an existing one with an invite code.
        </p>
      </header>

      {/* Existing Organizations */}
      {organizations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Select an organization</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {organizations.map((org) => (
              <form key={org.id} action={setActiveOrg.bind(null, org.id)}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full h-auto p-4 justify-start"
                >
                  <Building2 className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.slug}</p>
                  </div>
                </Button>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* Create or Join Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <CreateOrganizationDialog userId={session.user.id}>
          <Button className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Create New Organization
          </Button>
        </CreateOrganizationDialog>
        
        <JoinWithInviteDialog userId={session.user.id}>
          <Button variant="outline" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            Join with Invite Code
          </Button>
        </JoinWithInviteDialog>
      </div>

      {/* Clear Active Org (if any) */}
      {organizations.length > 0 && (
        <form action={clearOrg} className="flex flex-col items-start">
          <Button type="submit" variant="ghost" className="text-sm text-muted-foreground hover:text-brand-foreground">
            Clear active organization
          </Button>
        </form>
      )}

      <div className="rounded-lg border border-border/50 bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Pro tip:</strong> Organizations allow you to collaborate with other artists, producers, and labels. 
          Create separate organizations for different projects or teams.
        </p>
      </div>
    </div>
  );
}