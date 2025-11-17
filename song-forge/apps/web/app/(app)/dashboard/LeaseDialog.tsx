'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label
} from '@cronkwaters/ui';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Fragment, useMemo, useState, useTransition } from 'react';

import { useToast } from '../../../components/ui/Toast';
import { createLeaseAction } from '../../actions/createLease';

type Collaborator = {
  name: string;
  email: string;
  percentage: string;
};

interface LeaseDialogProps {
  songId: string;
  songTitle: string;
}

const INITIAL_COLLABORATOR: Collaborator = {
  name: '',
  email: '',
  percentage: '100'
};

export function LeaseDialog({ songId, songTitle }: LeaseDialogProps) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState('199');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([INITIAL_COLLABORATOR]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remainingPercent = useMemo(() => {
    const total = collaborators.reduce((sum, collaborator) => sum + Number(collaborator.percentage || 0), 0);
    return 100 - total;
  }, [collaborators]);

  const resetForm = () => {
    setPrice('199');
    setCollaborators([INITIAL_COLLABORATOR]);
    setError(null);
  };

  const handleCollaboratorChange = (index: number, field: keyof Collaborator, value: string) => {
    setCollaborators((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeCollaborator = (index: number) => {
    setCollaborators((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addCollaborator = () => {
    setCollaborators((prev) => [...prev, { name: '', email: '', percentage: '0' }]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError('Enter a valid lease price.');
      return;
    }

    const normalizedCollaborators = collaborators.map((collaborator) => ({
      name: collaborator.name.trim(),
      email: collaborator.email.trim(),
      percentage: Number(collaborator.percentage)
    }));

    if (normalizedCollaborators.some((collaborator) => !collaborator.name || !collaborator.email)) {
      setError('All collaborators require a name and email.');
      return;
    }

    if (normalizedCollaborators.some((collaborator) => Number.isNaN(collaborator.percentage) || collaborator.percentage <= 0)) {
      setError('Percentages must be positive numbers.');
      return;
    }

    const totalPercentage = normalizedCollaborators.reduce((sum, collaborator) => sum + collaborator.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError('Percentages must total 100%.');
      return;
    }

    const formData = new FormData();
    formData.append(
      'payload',
      JSON.stringify({
        songId,
        price: numericPrice,
        collaborators: normalizedCollaborators
      })
    );

    startTransition(async () => {
      const result = await createLeaseAction(formData);

      if (result.success) {
        toast.push('Lease finalized via Stripe.', { tone: 'success' });
        resetForm();
        setOpen(false);
      } else {
        toast.push(result.error ?? 'Lease could not be created.', { tone: 'error' });
        setError(result.error ?? 'Lease could not be created.');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && setOpen(nextOpen)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-soft hover:shadow-elevated">
          Lease
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-3xl border-border/60 bg-surface/95 p-0 shadow-elevated backdrop-blur">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-6 p-6"
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-semibold text-brand-foreground">Lease “{songTitle}”</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Set collaborator splits and trigger a Stripe Connect payout-ready lease in a single step.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lease-price">Lease price (USD)</Label>
              <Input
                id="lease-price"
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Collaborator splits</Label>
                <Button type="button" size="sm" variant="ghost" onClick={addCollaborator} disabled={isPending}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Remaining: {remainingPercent.toFixed(2)}%</p>
              <div className="space-y-3">
                {collaborators.map((collaborator, index) => (
                  <Fragment key={`collab-${index}`}>
                    <div className="grid gap-3 rounded-2xl border border-border/60 bg-surface/70 p-4 sm:grid-cols-[1fr_1fr_auto]">
                      <div className="space-y-2">
                        <Label htmlFor={`collab-name-${index}`}>Name</Label>
                        <Input
                          id={`collab-name-${index}`}
                          value={collaborator.name}
                          onChange={(event) => handleCollaboratorChange(index, 'name', event.target.value)}
                          disabled={isPending}
                          placeholder="Aria Stone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`collab-email-${index}`}>Email</Label>
                        <Input
                          id={`collab-email-${index}`}
                          type="email"
                          value={collaborator.email}
                          onChange={(event) => handleCollaboratorChange(index, 'email', event.target.value)}
                          disabled={isPending}
                          placeholder="aria@example.com"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`collab-percentage-${index}`}>% Split</Label>
                          <Input
                            id={`collab-percentage-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={collaborator.percentage}
                            onChange={(event) => handleCollaboratorChange(index, 'percentage', event.target.value)}
                            disabled={isPending}
                          />
                        </div>
                        {collaborators.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeCollaborator(index)}
                            disabled={isPending}
                            aria-label="Remove collaborator"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-danger-foreground">{error}</p>}

          <DialogFooter className="flex items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="px-6" disabled={isPending}>
              {isPending ? 'Processing…' : 'Create lease'}
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}
