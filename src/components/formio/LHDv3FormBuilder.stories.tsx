import React from "react";
import { useState } from "react";
import type { Meta, StoryObj } from '@storybook/react';
import { LHDv3FormBuilder } from './LHDv3Forms';
import { Form } from "@formio/react";

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

export const LargeList: Story = {
  render() {
    const [ lastForm, setLastForm ] = useState({});
    const [ formShown, setFormShown ] = useState<boolean>(false);

    const submission = { data: {
      organism: "Organism 737",
      rooms: "Room 311",
      textArea: "Area 51"
    } };

    const multiplier = 1000;

    return <div>
             { formShown ? <Form form={lastForm} 
                             submission={submission}/> : <></> }
             <LHDv3FormBuilder
               organisms={ multipliered((n) => `Organism ${n}`) }
               rooms={ multipliered((n) => `Room ${n}`) }
               onChange={(form) => setLastForm(form)}
             />
             <button onClick={() => setFormShown(true)}>Make a form!</button>
    </div>;

    function multipliered(pattern: (n: number) => string) : string[] {
      return Array.from({ length: multiplier }, (v, i) => pattern(i + 1));
    }
  }
}
