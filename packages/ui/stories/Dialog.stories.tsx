import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from '@cronkwaters/ui';
import { useState } from 'react';

const meta: Meta = {
  title: 'Primitives/Dialog',
  component: DialogContent,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite collaborators</DialogTitle>
            <DialogDescription>
              Share your workspace with writers and producers to start collaborating.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-brand-muted-foreground">
            We will send an invitation email with guidance on how to join the CronkWaters
            organization.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
};
