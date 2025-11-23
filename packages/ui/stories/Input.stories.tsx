import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@cronkwaters/ui';

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  args: {
    placeholder: 'Search tracks...',
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Read-only input',
  },
};
