import React from "react";

import type { Meta, StoryObj } from '@storybook/react';
import NewDispForm from './NewDispForm';

const meta = {
  title: 'NewDispForm',
  component: NewDispForm,
  tags: ['autodocs']
} satisfies Meta<typeof NewDispForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {

  }
};
