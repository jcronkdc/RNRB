import PageHeader from '../../../components/app/PageHeader';
import UploadDropzone from '../../../components/app/UploadDropzone';

export default function AssetsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Assets"
        subtitle="Upload audio and lyric files for your projects."
      />

      <UploadDropzone />

      <section className="rounded-3xl border border-border/60 bg-surface/80 px-6 py-10 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">
          Library view coming soon. You’ll be able to organize masters, stems, lyrics, and artwork with versioning and
          shareable links.
        </p>
      </section>
    </div>
  );
}

