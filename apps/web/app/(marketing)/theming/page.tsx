import ThemePreview from '../../../components/theme/ThemePreview';

export default function ThemeQaPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-brand-muted-foreground">Toolkit</p>
        <h1 className="text-4xl font-semibold text-brand-foreground">Theme QA</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Use the theme toggle in the navigation to preview how components render across Light, Dark, and Warm Studio
          modes. Verify contrast, focus outlines, and accessible states.
        </p>
      </header>
      <ThemePreview />
    </div>
  );
}
