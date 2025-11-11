import { Button } from '@songforge/ui';

const projects = [
  {
    name: 'Cedar & Rust',
    status: 'In arrangement',
    progress: 72,
    members: ['Ava', 'Marlow', 'Jules']
  },
  {
    name: 'Glass Rivers',
    status: 'Mix review',
    progress: 54,
    members: ['Jun', 'Devon']
  },
  {
    name: 'Honey Bloom',
    status: 'Final approvals',
    progress: 92,
    members: ['Cleo', 'Imani', 'Theo']
  }
] as const;

const highlights = [
  { label: 'Sessions this week', value: '8', tone: 'text-brand-primary' },
  { label: 'Assets uploaded', value: '142', tone: 'text-brand-secondary' },
  { label: 'Splits signed', value: '12', tone: 'text-success' }
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.label}
            className="rounded-3xl border border-border/60 bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{item.label}</p>
            <p className={`mt-4 text-3xl font-semibold ${item.tone}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border/60 bg-surface p-8 shadow-soft">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-brand-foreground">Active projects</h2>
            <p className="text-sm text-muted-foreground">
              Track creative status, collaborator alignment, and legal handshakes in one place.
            </p>
          </div>
          <Button size="sm" className="shadow-soft hover:shadow-elevated">
            New session
          </Button>
        </header>
        <div className="mt-8 grid gap-4">
          {projects.map((project) => (
            <article
              key={project.name}
              className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-surface-muted/60 p-5 transition hover:shadow-outline sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-foreground">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.status}</p>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {project.members.map((member) => (
                    <span key={member} className="rounded-full bg-surface px-3 py-1 shadow-outline">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
              <div className="sm:w-40">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-surface">
                  <div
                    className="h-2 rounded-full bg-brand-primary transition-all"
                    style={{ width: `${project.progress}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

