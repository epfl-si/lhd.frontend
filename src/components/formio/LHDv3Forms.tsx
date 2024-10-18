import * as React from "react";
import {FC} from "react";
import {FormBuilder, Formio} from "@formio/react";
import "formiojs/dist/formio.full.min.css";
import "epfl-elements/dist/css/elements.css";
import {LHDSelectComponent} from "./LHDSelect";
import {LHDMultiSelectComponent} from "./LHDMultiSelect";

export type LHDv3FormBuilderProps = {
	onChange: (newForm: LHDv3FormType) => void,
	form ?: any
}

export const LHDv3FormBuilder : FC<LHDv3FormBuilderProps> = ({onChange, form}) => {
	if (! form) {
		form = {}
	}
	return <FormBuilder
		form={ form }
		onChange={onChange}
	/>
}

export type LHDv3FormType = any;

Formio.use({
	components: {
		lhdselect: LHDSelectComponent,
		lhdmultiselect: LHDMultiSelectComponent
	}
});
