'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@cronkwaters/ui';
import { Button } from '@cronkwaters/ui';
import { Input } from '@cronkwaters/ui';
import { Label } from '@cronkwaters/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cronkwaters/ui';
import { createSplitSheetAction } from '@/lib/actions/splits';
import { useRouter } from 'next/navigation';

export function CreateSplitDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [type, setType] = useState<'recording' | 'composition'>('recording');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    
    setIsCreating(true);
    try {
      const result = await createSplitSheetAction({ 
        title, 
        projectId,
        type,
        initialSplits: [] 
      });
      
      if (result.data?.splitSheet) {
        setOpen(false);
        router.refresh();
      } else {
        console.error('Failed to create split sheet:', result.error);
      }
    } catch (error) {
      console.error('Error creating split sheet:', error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Split Sheet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Split Sheet</DialogTitle>
          <DialogDescription>
            Define how royalties will be split among collaborators for a specific project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Split Sheet Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Song Title - Master Recording"
              required
              autoFocus
              disabled={isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={isCreating}>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo-project">Demo Project</SelectItem>
                <SelectItem value="project-2">My Album</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Split Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'recording' | 'composition')} disabled={isCreating}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recording">Recording (Master)</SelectItem>
                <SelectItem value="composition">Composition (Publishing)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !projectId}>
              {isCreating ? 'Creating...' : 'Create Split Sheet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
