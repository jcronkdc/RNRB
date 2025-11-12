import { Button } from '@cronkwaters/ui';

const sessions = [
  {
    title: 'Morning chorus // 09:00',
    focus: 'Tracking harmonies & tightening lyric cadence',
    collaborators: ['Noah', 'Pia', 'Rhett'],
    status: 'Live'
  },
  {
    title: 'Field recordings // 14:30',
    focus: 'Layering analog textures recorded in Lisbon',
    collaborators: ['Zoe', 'Mina'],
    status: 'Review'
  },
  {
    title: 'Evening strings // 19:00',
    focus: 'Arranging quartet stems and approving balance notes',
    collaborators: ['Kai', 'Etta', 'Luc'],
    status: 'Prep'
  }
] as const;

export const dynamic = 'force-dynamic';

export default function SessionsPage() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface p-8 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand-foreground">Session planner</h2>
          <p className="text-sm text-muted-foreground">
            Hold space for creative flow with agendas, references, and a running log of takes.
          </p>
        </div>
        <Button size="sm" variant="subtle">
          Schedule session
        </Button>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        {sessions.map((session) => (
          <article
            key={session.title}
            className="flex h-full flex-col gap-4 rounded-3xl border border-border/60 bg-surface-muted/80 p-6 shadow-soft"
          >
            <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{session.status}</span>
            <h3 className="text-lg font-semibold text-brand-foreground">{session.title}</h3>
            <p className="text-sm text-muted-foreground">{session.focus}</p>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground/90">
              {session.collaborators.map((name) => (
                <span key={name} className="rounded-full bg-surface px-3 py-1 shadow-outline">
                  {name}
                </span>
              ))}
            </div>
            <Button variant="ghost" className="mt-auto justify-start px-0 text-brand-primary">
              Open timeline
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

