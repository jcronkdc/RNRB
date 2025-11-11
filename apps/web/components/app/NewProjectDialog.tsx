'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label } from '@songforge/ui';
import { ProjectTemplates } from './ProjectTemplates';

export type ProjectVisibility = 'private' | 'org' | 'public';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onCreate?: (payload: { name: string; visibility: ProjectVisibility }) => void;
  showTemplates?: boolean;
}

export default function NewProjectDialog({ open, onOpenChange, onCreate, showTemplates = true }: NewProjectDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [showTemplateSelection, setShowTemplateSelection] = useState(showTemplates);

  useEffect(() => {
    if (open) {
      setShowTemplateSelection(showTemplates);
      nameRef.current?.focus();
    } else {
      formRef.current?.reset();
      setShowTemplateSelection(showTemplates);
    }
  }, [open, showTemplates]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = (data.get('name') as string)?.trim();
    if (!name) {
      nameRef.current?.focus();
      return;
    }
    onCreate?.({ name, visibility: (data.get('visibility') as ProjectVisibility) ?? 'private' });
    onOpenChange(false);
  };

  if (showTemplateSelection && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl border-border/60 bg-surface shadow-soft">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-brand-foreground">New project</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Choose a template to get started faster, or create a blank project.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <ProjectTemplates
              onSelect={(template) => {
                setShowTemplateSelection(false);
                // Pre-fill form with template defaults
                if (nameRef.current) {
                  nameRef.current.value = template.name;
                }
              }}
              onCancel={() => {
                setShowTemplateSelection(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-surface shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-brand-foreground">New project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">Spin up a fresh canvas for your next release, session, or event.</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" name="name" placeholder="Working title" autoComplete="off" required ref={nameRef} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-visibility">Visibility</Label>
            <select
              id="project-visibility"
              name="visibility"
              defaultValue="private"
              className="h-11 w-full rounded-lg border border-border/60 bg-surface px-3 text-sm text-brand-foreground shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <option value="private">Private (just you)</option>
              <option value="org">Organization members</option>
              <option value="public">Public showcase</option>
            </select>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
