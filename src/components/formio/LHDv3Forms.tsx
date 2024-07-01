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
           options={
	     {
               builder: {
	         custom: {
		   title: 'LHD Fields',
		   components: {
                     organism: OrganismDropDownList.options,
                     room: RoomDropDownList.options
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

export type FormBuilderOptions = any;

export const OrganismDropDownList = Object.assign(
  (({}) => {
  }) as FC<OrganismDropDownListProps>,
  {
    options: {
      title: 'Organism',
      key: 'organism',
      icon: 'terminal',
      schema: {
	label: 'Organism',
	type: 'select',
	key: 'organism',
	input: true,
	dataSrc: 'json',
	template: "<span>{{ item.organism }}</span>",
	data: {
	  json: ['Or', 'Ga', 'Nism']
	}
      }
    } as FormBuilderOptions
  }
);

export type RoomDropDownListProps = {
}

export const RoomDropDownList = Object.assign(
  (({}) => {
  }) as FC<RoomDropDownListProps>,
  {
    options: {
      title: 'Rooms',
      key: 'rooms',
      icon: 'terminal',
      schema: {
	label: 'Other impacted rooms',
	type: 'select',
	multiple: true,
	key: 'otherImpactedRooms',
	input: true,
	dataSrc: 'json',
	template: "<span>{{ item.name }}</span>",
	data: {
	  json: ['Room 1', 'Room 2']
	}
      },
    } as FormBuilderOptions
  }
);
