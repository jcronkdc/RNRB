import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "../src/components/input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered"
  },
  args: {
    placeholder: "Search catalog..."
  }
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Invalid: Story = {
  args: {
    isInvalid: true,
    placeholder: "Email address"
  }
};

