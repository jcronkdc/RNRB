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
import { Textarea } from '@cronkwaters/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cronkwaters/ui';
import { createSessionAction } from '@/lib/actions/sessions';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface CreateSessionDialogProps {
  orgId: string;
  children: React.ReactNode;
}

export function CreateSessionDialog({ orgId, children }: CreateSessionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [type, setType] = useState<'writing' | 'recording' | 'meeting' | 'rehearsal'>('writing');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    
    setIsCreating(true);
    try {
      // Combine date and time
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);
      
      const result = await createSessionAction({ 
        title, 
        projectId,
        type,
        startTime: startDateTime,
        endTime: endDateTime,
        location,
        notes
      });
      
      if (result.data?.session) {
        setOpen(false);
        router.refresh();
      } else {
        console.error('Failed to create session:', result.error);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
          <DialogDescription>
            Book studio time and invite collaborators to your session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Writing session for Track 3"
              required
              autoFocus
              disabled={isCreating}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId} disabled={isCreating}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demo-project">Demo Project</SelectItem>
                  <SelectItem value="album-1">My First Album</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Session Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)} disabled={isCreating}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="recording">Recording</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="rehearsal">Rehearsal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isCreating}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={isCreating}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Studio A, Zoom link, etc."
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Session goals, prep work, equipment needed..."
              rows={3}
              disabled={isCreating}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !projectId}>
              {isCreating ? 'Creating...' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
