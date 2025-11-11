'use client';

import { useState } from 'react';
import { Download, FileText, Share2, Copy } from 'lucide-react';
import { Button } from '@songforge/ui';
import { cn } from '@songforge/ui';

interface ExportMenuProps {
  projectSlug: string;
  projectName: string;
  className?: string;
}

export function ExportMenu({ projectSlug, projectName, className }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportPDF = async () => {
    // TODO: Implement PDF export
    console.log('Export PDF for', projectSlug);
    setIsOpen(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/app/projects/${projectSlug}`;
    if (navigator.share) {
      await navigator.share({
        title: projectName,
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/app/projects/${projectSlug}`;
    await navigator.clipboard.writeText(url);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-border/60 bg-surface/95 p-2 shadow-lg backdrop-blur-sm">
            <button
              onClick={handleShare}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-muted"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Share Project</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-muted"
            >
              <Copy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Copy Link</span>
            </button>
            <div className="my-2 border-t border-border/50" />
            <button
              onClick={handleExportPDF}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-surface-muted"
            >
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Export PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

