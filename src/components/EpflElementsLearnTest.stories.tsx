/**
 * This file demonstrates a  Storybook-based split workflow between
 * a “generic” React package (here, epfl-elements-react) and the
 * “specific” project (here, LHDv3), *without* having to go through
 * `npm publish` or equivalent, after every change to the former.
 *
 * In order to consumee “native” TypeScript from the “generic” React
 * package, two conditions must be met:
 *
 * - The “generic” package must be made available as an *unpackaged*
 *   dependency out of some checked out Git clone, rather than as a
 *   download from the official (or an unofficial) NPM registry.
 *   To achieve this with Yarn “berry” (latest) version, the command
 *   (to be run from the “specific” project's directory) is
 *
 *       GENERIC_PACKAGE_NAME=epfl-elements-react
 *       GENERIC_PACKAGE_DIR=../epfl-elements-react
 *       yarn add "$GENERIC_PACKAGE_NAME"@file:"$GENERIC_PACKAGE_DIR"   yarn add epfl-elements-react@file:../epfl-elements-react
 *
 * - The imports from the “generic” package must be rewritten (on a
 *   temporary basis) to reach directly into its source tree in the
 *   proper place, e.g.
 *
 *      import { Button } from 'epfl-elements-react';
 *
 *   must be (temporarily) rewritten to
 *
 *      import { Button } from 'epfl-elements-react-si-extra';
 */

import React from "react";
import type { Meta, StoryObj } from '@storybook/react';
import {Button} from "epfl-elements-react-si-extra";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/EpflElementsLearnTest',
  component: FormLearnTest,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof FormLearnTest>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  render() {
    return <FormLearnTest></FormLearnTest>
  }
};

/*****************************************************************/

// In a real setup, the following would be in its own file i.e.
// FormLearnTest.tsx (except with a more serious-sounding name).

// This is the *development* version; it will only work if
// the conditions described at the top of this file are met.
// In production, the following will have to be made to work instead:
// import { Button } from 'epfl-elements-react';

type FormLearnTestProps = {
};

export function FormLearnTest (props : FormLearnTestProps) {
  return <form>
           <Button>This is some form!</Button>
         </form>
}
