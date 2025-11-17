import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/components/button";
import { ToastProvider, useToast } from "../src/components/toast";

const meta: Meta = {
  title: "Components/Toast",
  parameters: {
    layout: "centered"
  }
};

export default meta;

const Demo = () => {
  const { toast } = useToast();

  return (
    <Button
      onClick={() =>
        toast({
          title: "Release scheduled",
          description: "We'll remind your followers 24 hours before launch."
        })
      }
    >
      Trigger toast
    </Button>
  );
};

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  )
};

