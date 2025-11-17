import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../src/components/button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered"
  },
  args: {
    children: "Launch Song",
    variant: "primary",
    size: "md"
  }
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary"
  }
};

export const Ghost: Story = {
  args: {
    variant: "ghost"
  }
};

export const Outline: Story = {
  args: {
    variant: "outline"
  }
};

