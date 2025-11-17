import PageHeader from '../../../components/app/PageHeader';
import ProfileForm from '../../../components/app/ProfileForm';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <PageHeader title="Settings" subtitle="Manage your profile." />
      <ProfileForm name="Demo User" email="demo@example.com" />
    </div>
  );
}

