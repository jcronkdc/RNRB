import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@cronkwater/ui';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  args: {
    children: 'Click me'
  }
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'default'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'subtle'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost'
  }
};
