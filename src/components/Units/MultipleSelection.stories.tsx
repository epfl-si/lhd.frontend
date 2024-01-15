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
    all: [{sciper: 12341, name: 't1', surname:' tt1'},
      {sciper: 12342, name: 't2', surname:' tt2'},
      {sciper: 12343, name: 't3', surname:' tt3'},
      {sciper: 12344, name: 't4', surname:' tt4'},
      {sciper: 12345, name: 't5', surname:' tt5'},
      {sciper: 12346, name: 't6', surname:' tt6'}],
    selected: [{sciper: 1234, name: 'Rosa', surname:' Maggi'},
      {sciper: 354345, name: 'Rosa111', surname:' Maggi111'},
      {sciper: 78978978, name: 'Rosa222', surname:' Maggi2222'}],
    objectName: 'Person'
  }
};
