'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@cronkwaters/ui';
import { Button } from '@cronkwaters/ui';
import { Input } from '@cronkwaters/ui';
import { Label } from '@cronkwaters/ui';
import { Textarea } from '@cronkwaters/ui';
import { Switch } from '@cronkwaters/ui';
import { useToast } from '@cronkwaters/ui';
import { createTourAction } from '@/lib/actions/tours';
import { generateSlug } from '@cronkwaters/db';
import type { Tour } from '@prisma/client';

interface NewTourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTourCreated: (tour: Tour & { _count: { shows: number } }) => void;
}

export function NewTourDialog({
  open,
  onOpenChange,
  onTourCreated,
}: NewTourDialogProps) {
  const _router = useRouter();
    const { notify } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    startDate: '',
    endDate: '',
    public: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, String(value));
      });

      const tour = await createTourAction(formDataObj);
      
      notify({
        title: 'Tour created!',
        description: `${tour.name} has been created successfully.`,
      });

      onTourCreated({ ...tour, _count: { shows: 0 } });
      setFormData({
        name: '',
        slug: '',
        description: '',
        startDate: '',
        endDate: '',
        public: false,
      });
    } catch (error) {
      notify({
        title: 'Error creating tour',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Tour
          </DialogTitle>
          <DialogDescription>
            Plan your tour dates and manage show logistics in one place.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tour Name</Label>
            <Input
              id="name"
              placeholder="Summer Tour 2024"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your tour..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="public" className="text-base">
                Make Public
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow fans to see this tour on your public profile
              </p>
            </div>
            <Switch
              id="public"
              checked={formData.public}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, public: checked }))
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Tour
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

