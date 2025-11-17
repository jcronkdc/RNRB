import { Button } from '@cronkwaters/ui';

export default function OrganizationOnboardingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-brand-foreground">Choose or Create an Organization</h1>
        <p className="text-sm text-muted-foreground">
          Your active organization determines which projects, splits, and sessions you can access. Selecting
          one here will set your SongForge organization cookie.
        </p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1" onClick={(event) => event.preventDefault()}>
          Create Organization
        </Button>
        <Button variant="outline" className="flex-1" onClick={(event) => event.preventDefault()}>
          Join with Invite
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        These actions are placeholders. In a future update, they will create or join an organization and set
        the active org cookie securely.
      </p>
    </div>
  );
}

