import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input
} from '@songforge/ui';

const colorTokens = [
  { label: 'Background', variable: '--sf-color-background' },
  { label: 'Surface', variable: '--sf-color-surface' },
  { label: 'Primary', variable: '--sf-color-brand-primary' },
  { label: 'Secondary', variable: '--sf-color-brand-secondary' },
  { label: 'Accent', variable: '--sf-color-accent' }
];

export default function StyleGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-24 sm:px-12">
      <header className="flex flex-col gap-4 text-center sm:text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">SongForge</span>
        <h1 className="text-balance font-serif text-4xl font-semibold text-brand-foreground sm:text-5xl">
          Design primitives
        </h1>
        <p className="text-pretty text-base text-muted-foreground sm:text-lg">
          Tokens and components that anchor the SongForge visual language—warm neutrals, tactile typography, and soft
          shadows.
        </p>
      </header>

      <section className="grid gap-10 md:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-surface p-6 shadow-soft">
          <h2 className="text-sm uppercase tracking-[0.28em] text-brand-muted-foreground">Buttons</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface p-6 shadow-soft">
          <h2 className="text-sm uppercase tracking-[0.28em] text-brand-muted-foreground">Inputs & dialogs</h2>
          <div className="mt-4 flex flex-col gap-4">
            <Input placeholder="Project title" />
            <Input placeholder="Collaborator email" type="email" />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-fit">Open dialog</Button>
              </DialogTrigger>
              <DialogContent className="bg-surface shadow-elevated">
                <DialogHeader>
                  <DialogTitle>Invite collaborator</DialogTitle>
                  <DialogDescription>
                    Share access and keep track of contributions across the collective.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Name" />
                  <Input placeholder="Email" type="email" />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-surface p-6 shadow-soft">
        <h2 className="text-sm uppercase tracking-[0.28em] text-brand-muted-foreground">Color tokens</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-5">
          {colorTokens.map((token) => (
            <div
              key={token.variable}
              className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-surface-muted p-4 text-sm"
            >
              <div
                className="h-20 w-full rounded-xl border border-border/60 shadow-soft"
                style={{ backgroundColor: `hsl(var(${token.variable}))` }}
              />
              <p className="font-medium text-brand-foreground">{token.label}</p>
              <p className="text-xs text-muted-foreground">{token.variable}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

