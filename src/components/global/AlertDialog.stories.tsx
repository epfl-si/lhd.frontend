import type {Meta, StoryObj} from '@storybook/react';

import {AlertDialog} from './AlertDialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Alert: Story = {
  args: {
    openDialog: true,
    onOkClick: okClick,
    onCancelClick: cancelClick,
    cancelLabel: "Cancel",
    okLabel: "Delete",
    title: "Test title",
    body: "Test body"
  }
};

function cancelClick() {
  console.log("Cancel");
}

function okClick() {
  console.log("Deleted");
}
