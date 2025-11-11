'use client';

import { useEffect, useRef, type FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea
} from '@songforge/ui';

const TEMPLATES = ['Collab NDA', 'Work-for-Hire', 'Non-exclusive Collab', 'Podcast Music License'] as const;

interface NewLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (license: {
    id: string;
    template: (typeof TEMPLATES)[number];
    title: string;
    notes?: string;
  }) => void;
}

export default function NewLicenseDialog({ open, onOpenChange, onCreate }: NewLicenseDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
    } else {
      formRef.current?.reset();
    }
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = (data.get('title') as string)?.trim();
    if (!title) {
      titleRef.current?.focus();
      return;
    }

    const template = (data.get('template') as (typeof TEMPLATES)[number]) ?? 'Collab NDA';
    const notes = (data.get('notes') as string)?.trim();

    onCreate?.({
      id: `license-${Date.now()}`,
      template,
      title,
      notes: notes || undefined
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-surface shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-brand-foreground">New license</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Draft a production, collaboration, or clearance document for this project.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="license-template">Template</Label>
            <select
              id="license-template"
              name="template"
              className="h-11 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm text-brand-foreground shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              defaultValue={TEMPLATES[0]}
            >
              {TEMPLATES.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="license-title">Title</Label>
            <Input id="license-title" name="title" ref={titleRef} placeholder="Collab NDA - April 2025" required autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license-notes">Notes</Label>
            <Textarea
              id="license-notes"
              name="notes"
              placeholder="Outline any clauses, terms, or collaborators to highlight."
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create license</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
