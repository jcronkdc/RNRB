import { Button } from '@songforge/ui';
import { setActiveOrgCookie } from '@songforge/auth';
import { redirect } from 'next/navigation';

async function setDemoOrg() {
  'use server';
  setActiveOrgCookie('demo-org');
  redirect('/app/projects');
}

async function clearOrg() {
  'use server';
  setActiveOrgCookie(null);
  redirect('/onboarding/organization');
}

export default function OrganizationOnboardingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand-foreground">Choose or Create an Organization</h1>
        <p className="text-sm text-muted-foreground">
          Select a temporary demo organization to explore the dashboard. These actions only manage the
          `sf_org` cookie until real onboarding is in place.
        </p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={setDemoOrg} className="flex-1">
          <Button type="submit" className="w-full">
            Create Demo Organization
          </Button>
        </form>
        <div className="flex-1">
          <Button type="button" variant="outline" className="w-full" disabled>
            Join with Invite (coming soon)
          </Button>
        </div>
      </div>
      <form action={clearOrg} className="flex flex-col items-start">
        <Button type="submit" variant="ghost" className="text-sm text-muted-foreground hover:text-brand-foreground">
          Clear active org
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">
        When full onboarding arrives, you&apos;ll be able to create organizations, invite collaborators, and
        switch contexts seamlessly.
      </p>
    </div>
  );
}
