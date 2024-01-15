import type { Meta, StoryObj } from '@storybook/react';

import { MultipleSelection } from './MultipleSelection';
import React from "react";

const meta: Meta<typeof MultipleSelection> = {
  title: 'MultipleSelection',
  component: MultipleSelection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Selection: Story = {
  args: {
    all: [],
    selected: [{sciper: 1234, name: 'Rosa', surname:' Maggi'},
      {sciper: 354345, name: 'Rosa111', surname:' Maggi111'},
      {sciper: 78978978, name: 'Rosa222', surname:' Maggi2222'}]
  }
};
