import * as React from "react";
import { FormBuilder } from "@formio/react";
import { FC } from "react";
import "formiojs/dist/formio.full.min.css";
import "epfl-elements/dist/css/elements.css";

export type LHDv3FormBuilderProps = {
  onChange: (newForm: LHDv3FormType) => void
}

export const LHDv3FormBuilder : FC<LHDv3FormBuilderProps> = ({ onChange }) => {
  return <FormBuilder
           form={ {} }
           onChange={ onChange }
         />

}

export type LHDv3FormType = any;
