'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label
} from '@cronkwater/ui';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MutableRefObject
} from 'react';

interface ContributorInput {
  name: string;
  pct: string;
  ref?: MutableRefObject<HTMLInputElement | null>;
}

interface NewSplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (split: { id: string; title: string; contributors: { name: string; pct: number }[] }) => void;
}

const clampPct = (value: string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  if (num < 0) return '0';
  if (num > 100) return '100';
  return String(Math.round(num));
};

export default function NewSplitDialog({ open, onOpenChange, onCreate }: NewSplitDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const nameRefs = useRef<Array<MutableRefObject<HTMLInputElement | null>>>([]);
  const [contributors, setContributors] = useState<ContributorInput[]>([
    { name: '', pct: '60', ref: { current: null } },
    { name: '', pct: '40', ref: { current: null } }
  ]);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setContributors([
      { name: '', pct: '60', ref: { current: null } },
      { name: '', pct: '40', ref: { current: null } }
    ]);
    setError(null);
  };

  useEffect(() => {
    if (open) {
      titleRef.current?.focus();
    } else {
      formRef.current?.reset();
      resetForm();
    }
  }, [open]);

  const totalPct = useMemo(
    () =>
      contributors.reduce((acc, contributor) => acc + (Number(contributor.pct) || 0), 0),
    [contributors]
  );

  const updateContributor = (index: number, field: keyof ContributorInput, value: string) => {
    setContributors((prev) =>
      prev.map((entry, idx) => (idx === index ? { ...entry, [field]: field === 'pct' ? clampPct(value) : value } : entry))
    );
  };

  const addContributor = () => {
    const newRef = { current: null } as MutableRefObject<HTMLInputElement | null>;
    setContributors((prev) => [...prev, { name: '', pct: '0', ref: newRef }]);
    nameRefs.current.push(newRef);
    setTimeout(() => newRef.current?.focus(), 0);
  };

  const removeContributor = (index: number) => {
    setContributors((prev) => prev.filter((_, idx) => idx !== index));
    nameRefs.current.splice(index, 1);
  };

  const validate = () => {
    if (totalPct !== 100) {
      return 'Split total must equal 100%.';
    }
    for (const contributor of contributors) {
      if (!contributor.name.trim()) {
        return 'Each contributor needs a name.';
      }
      const pct = Number(contributor.pct);
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return 'Percent values must be between 0 and 100.';
      }
    }
    return null;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = (data.get('title') as string)?.trim();
    if (!title) {
      setError('Title is required.');
      titleRef.current?.focus();
      return;
    }

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const parsedContributors = contributors.map((contributor) => ({
      name: contributor.name.trim(),
      pct: Number(contributor.pct)
    }));

    onCreate?.({
      id: `split-${Date.now()}`,
      title,
      contributors: parsedContributors
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border/60 bg-surface shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-brand-foreground">New split</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Define contributor percentages for this project release or mix.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="split-title">Title</Label>
            <Input id="split-title" name="title" placeholder="Main mix split" ref={titleRef} required autoComplete="off" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span id="contributors-label">Contributors</span>
              <span className={totalPct === 100 ? 'text-brand-foreground' : 'text-brand-primary'}>Total: {totalPct}%</span>
            </div>
            {contributors.map((contributor, index) => {
              if (!nameRefs.current[index]) {
                nameRefs.current[index] = contributor.ref ?? { current: null };
              }
              return (
                <div key={index} className="grid grid-cols-[2fr_minmax(80px,1fr)_auto] items-start gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`contributor-name-${index}`}>Name</Label>
                    <Input
                      id={`contributor-name-${index}`}
                      value={contributor.name}
                      onChange={(event) => updateContributor(index, 'name', event.target.value)}
                      placeholder="Contributor name"
                      autoComplete="off"
                      ref={(el) => {
                        nameRefs.current[index] = { current: el };
                        contributor.ref = nameRefs.current[index];
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`contributor-pct-${index}`}>Percent</Label>
                    <Input
                      id={`contributor-pct-${index}`}
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={contributor.pct}
                      onChange={(event) => updateContributor(index, 'pct', event.target.value)}
                      inputMode="numeric"
                      aria-describedby="contributors-label"
                    />
                  </div>
                  <div className="flex h-full items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContributor(index)}
                      disabled={contributors.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between">
              <Button type="button" variant="outline" size="sm" onClick={addContributor}>
                Add contributor
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Ensure the total adds up to 100% before creating the split.</p>
            {error ? (
              <p className="text-xs text-brand-primary" role="alert" id="split-error">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create split</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
