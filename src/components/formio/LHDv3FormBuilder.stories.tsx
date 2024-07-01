import React from "react";
import type { Meta, StoryObj } from '@storybook/react';
import { LHDv3FormBuilder } from './LHDv3Forms';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta : Meta<typeof LHDv3FormBuilder> = {
  title: 'FormIO/LHDv3FormBuilder',
  component: LHDv3FormBuilder,
  parameters: {
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof LHDv3FormBuilder>;
export const Simple: Story = {
  args: {
    organisms: ['Or', 'Ga', 'Nism'],
    rooms: ['Room 1', 'Room 2']
  }
};
