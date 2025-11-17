import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/components/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../src/components/dialog";

const meta: Meta = {
  title: "Components/Dialog",
  parameters: {
    layout: "centered"
  }
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Boost release</DialogTitle>
          <DialogDescription>
            Amplify your song with AI powered mastering and targeted fan drops.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm text-neutral-600">
          <p>Select the mastering depth and we will queue the render in seconds.</p>
          <p>You can monitor the progress from your dashboard.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Launch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

