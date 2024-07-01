import * as React from "react";
import { FormBuilder } from "@formio/react";
import { FC } from "react";
import "formiojs/dist/formio.full.min.css";
import "epfl-elements/dist/css/elements.css";

export type LHDv3FormBuilderProps = {
  onChange: (newForm: LHDv3FormType) => void,
  organisms: string[],
  rooms: string[],
}

export const LHDv3FormBuilder : FC<LHDv3FormBuilderProps> = ({ onChange, organisms, rooms }) => {
  return <FormBuilder
           form={ {} }
           options={
	     {
               builder: {
	         custom: {
		   title: 'LHD Fields',
		   components: {
                     organism: dropdownListOptions('Organism', 'organism', 'terminal', organisms),
                     room: dropdownListOptions('Rooms', 'rooms', 'terminal', rooms),
                   }
	         }
	       }
             }
           }
           onChange={ onChange }
         />

}

export type LHDv3FormType = any;

export type OrganismDropDownListProps = {
}


function dropdownListOptions (title: string, key: string, icon: string,
  values : string[]) {
    return {
      title,
      key,
      icon,
      schema: {
	label: title,
	type: 'select',
	key,
	input: true,
	dataSrc: 'json',
	data: {
	  json: values
	}
      }
    };
}
