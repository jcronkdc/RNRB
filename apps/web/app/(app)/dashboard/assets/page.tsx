import { Button } from '@songforge/ui';

const assets = [
  { name: 'Honey Bloom // vocal comp', type: 'Audio stem', updated: '2 hours ago', size: '48 MB' },
  { name: 'Glass Rivers // mix v07', type: 'Session bundle', updated: 'Yesterday', size: '1.3 GB' },
  { name: 'Festival poster – dusk', type: 'Artwork', updated: '3 days ago', size: '9 MB' },
  { name: 'Splits – Midnight Drafts', type: 'Document', updated: 'Last week', size: '210 KB' }
] as const;

export default function AssetsPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface p-8 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand-foreground">Asset library</h2>
          <p className="text-sm text-muted-foreground">
            Versioned stems, artwork, and agreements—kept precise with automatic metadata and previews.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Upload
          </Button>
          <Button size="sm">Create collection</Button>
        </div>
      </header>
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-soft">
        <table className="min-w-full divide-y divide-border/60 text-left text-sm">
          <thead className="bg-surface-muted text-muted-foreground">
            <tr>
              <th className="px-6 py-3 font-medium uppercase tracking-[0.3em]">Asset</th>
              <th className="px-6 py-3 font-medium uppercase tracking-[0.3em]">Type</th>
              <th className="px-6 py-3 font-medium uppercase tracking-[0.3em]">Updated</th>
              <th className="px-6 py-3 font-medium uppercase tracking-[0.3em]">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-surface">
            {assets.map((asset) => (
              <tr key={asset.name} className="transition hover:bg-surface-muted/70">
                <td className="px-6 py-4 text-brand-foreground">{asset.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{asset.type}</td>
                <td className="px-6 py-4 text-muted-foreground">{asset.updated}</td>
                <td className="px-6 py-4 text-muted-foreground">{asset.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

