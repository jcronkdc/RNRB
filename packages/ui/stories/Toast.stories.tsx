import type { Meta, StoryObj } from '@storybook/react';
import { Button, ToastProvider, useToast } from '@cronkwaters/ui';

function DemoToasts() {
  const { notify } = useToast();

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={() =>
          notify({
            title: 'Song exported',
            description: 'Your latest mix is ready to share.',
          })
        }
      >
        Show success toast
      </Button>
      <Button
        variant="subtle"
        onClick={() =>
          notify({
            title: 'Invite sent',
            description: 'An invitation email was sent to alex@cronkwaters.dev.',
            duration: 6000,
          })
        }
      >
        Show info toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          notify({
            title: 'Export failed',
            description: 'The mixdown service returned an error. Try again shortly.',
            variant: 'destructive',
          })
        }
      >
        Show error toast
      </Button>
    </div>
  );
}

const meta: Meta = {
  title: 'Feedback/Toast',
  component: DemoToasts,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj;

export const Playground: Story = {
  render: () => <DemoToasts />,
};
