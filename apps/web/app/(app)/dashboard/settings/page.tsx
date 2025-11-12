import { Button, Input } from '@cronkwater/ui';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div className="grid gap-10">
      <section className="rounded-3xl border border-border/60 bg-surface p-8 shadow-soft">
        <header className="mb-6 space-y-2">
          <h2 className="text-xl font-semibold text-brand-foreground">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update how CronkWater introduces you to collaborators and partners.
          </p>
        </header>
        <form className="grid gap-5 md:grid-cols-2">
          <label htmlFor="display-name" className="flex flex-col gap-2 text-sm font-medium text-brand-foreground">
            Display name
            <Input id="display-name" defaultValue="Aurora Collective" className="bg-surface-elevated" />
          </label>
          <label htmlFor="primary-email" className="flex flex-col gap-2 text-sm font-medium text-brand-foreground">
            Primary email
            <Input id="primary-email" defaultValue="studio@cronkwater.dev" className="bg-surface-elevated" />
          </label>
          <label htmlFor="bio" className="flex flex-col gap-2 text-sm font-medium text-brand-foreground md:col-span-2">
            Bio
            <textarea
              id="bio"
              defaultValue="CronkWater curates modern songwriting experiences, from remote sessions to cinematic showcases."
              className="min-h-[120px] rounded-xl border border-border/60 bg-surface-elevated px-4 py-3 text-sm text-brand-foreground outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-background"
            />
          </label>
          <div className="flex items-center justify-end gap-3 md:col-span-2">
            <Button variant="ghost">Discard</Button>
            <Button>Save changes</Button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-border/60 bg-surface p-8 shadow-soft">
        <header className="mb-6 space-y-2">
          <h2 className="text-xl font-semibold text-brand-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Fine-tune when CronkWater nudges you about sessions, splits, and new releases.
          </p>
        </header>
        <div className="space-y-4 text-sm text-brand-foreground">
          {[
            {
              label: 'Session reminders',
              description: 'Daily digest plus 30-minute reminders for any session you host.'
            },
            {
              label: 'Split signatures',
              description: 'Immediate alerts when a collaborator signs or requests revisions.'
            },
            {
              label: 'Release announcements',
              description: 'Monthly journal including podcast drops and festival news.'
            }
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-surface-muted/70 p-5 shadow-outline md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

