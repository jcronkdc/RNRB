import { setActiveOrgCookie } from '@cronkwater/auth';
import { redirect } from 'next/navigation';

import OrgSettingsForm from '../../../../components/app/OrgSettingsForm';
import PageHeader from '../../../../components/app/PageHeader';

export const dynamic = 'force-dynamic';

const ORG_ID = 'org-cronkwater-foundation';

async function setActiveOrg(formData: FormData) {
  'use server';
  const orgId = (formData.get('orgId') as string) ?? ORG_ID;
  await setActiveOrgCookie(orgId);
  redirect('/app/settings/org');
}

async function clearActiveOrg() {
  'use server';
  await setActiveOrgCookie(null);
  redirect('/app/settings/org');
}

export default function OrgSettingsPage() {
  return (
    <div className="space-y-10">
      <PageHeader title="Organization" subtitle="Manage your organization." />
      <OrgSettingsForm
        orgId={ORG_ID}
        name="CronkWater Foundation"
        slug="cronkwater-foundation"
        orgType="Foundation"
        brandColor="#6c5ce7"
        members={[
          { id: 'member-1', name: 'Demo User', role: 'Owner' },
          { id: 'member-2', name: 'Mae Rivera', role: 'Admin' },
          { id: 'member-3', name: 'Atlas Mastering', role: 'Member' }
        ]}
        setActiveAction={setActiveOrg}
        clearActiveAction={clearActiveOrg}
      />
    </div>
  );
}
