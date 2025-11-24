import { AlertColor } from '@mui/material';

export type notificationType = {
	type: AlertColor;
	text: string;
};

export type parameterType = {
	value: string;
	label: string;
};

export type columnType = {
	field: string;
	headerName: string;
	width: number;
};

export type kindType = {
	name: string;
};

export type hazardCategory = {
	hazard_category_name: string;
};

export type lhdUnitsFromAPIType = {
	name: string;
	path: string;
	unitId: string;
	responsibleId: number;
	responsibleFirstName: string;
	responsibleLastName: string;
	responsibleEmail: string;
	status?: 'New' | 'Deleted' | 'Default';
};

export type organismType = {
	id: string;
	organism: string;
	risk_group: number;
	filePath: string;
	updated_on: Date;
	updated_by: string;
}

export type chemicalsType = {
	id: string;
	cas_auth_chem: string;
	auth_chem_en: string;
	flag_auth_chem: boolean;
	auth_code?: string;
	fastway?: boolean;
}

export type authorizationType = {
	id: string;
	authorization: string;
	expiration_date: Date;
	status: string;
	creation_date: Date;
	renewals: number;
	type: string;
	unit: lhdUnitsType;
	authorization_rooms: roomDetailsType[];
	authorization_holders: personType[];
	authorization_chemicals: chemicalsType[];
	authorization_radiations: sourceType[];
	authority?: string;
}

export type lhdUnitsType = {
	name: string;
	unitId?: number;
	id: string;
	cosecs: personType[];
	professors: personType[];
	subUnits: lhdUnitsType[];
	institute?: instituteType;
	responsible?: responsible;
	unitType: string;
	status?: 'New' | 'Deleted' | 'Default';
};

export type sourceType = {
	source: string;
	status?: 'New' | 'Deleted' | 'Default';
};

type responsible = {
	sciper: number;
}

type instituteType = {
	name?: string;
	school?: schoolType;
}

type schoolType = {
	name?: string;
}

export type reportFile = {
	id: string;
	name: string;
	path: string;
	unitName: string;
}

export type personType = {
	name: string;
	surname: string;
	sciper: number;
	email?: string;
	type?: string;
	status?: 'New' | 'Deleted' | 'Default';
};

export type hazardDetailsType = {
	lab_display: string,
	hazard_category_name: string,
	parent_submission: string,
	child_submission: string,
	id_lab_has_hazards_child: string,
	id_lab_has_hazards: number
	global_comment?: string,
	modified_by?: string,
	modified_on?: Date
}

export type roomDetailsType = {
	id: string,
	name: string;
	building?: string;
	sector?: string;
	floor?: string;
	kind?: kindType;
	vol?: number;
	vent?: string;
	adminuse?: string;
	facultyuse?: string;
	lab_type_is_different?: boolean;
	site?: string;
	hazards: hazardType[];
	hazardAdditionalInfo?: hazardAdditionalInfoType[];
	hazardReferences?: hazardReferencesType[]
	lhd_units: lhdUnitsType[];
	haz_levels: hazLevelsType[];
	yearly_audits?: number;
	hazardsListName?: string[];
	submissionList?: submissionForm[];
	status?: 'New' | 'Deleted' | 'Default';
	assignedTo?: string;
	isDeleted?: boolean
};

export type hazardReferencesType = {
	submission: string;
	hazards: hazardType;
}

export type hazardAdditionalInfoType = {
	id?: string;
	comment?: string;
	modified_by?: string;
	modified_on?: string;
	hazard_category?: hazardCategory;
	file?: string;
	fileName?: string;
	filePath?: string;
	hazardsAdditionalInfoHasTag?: hazardsAdditionalInfoHasTagType[];
	id?: string;
}

export type hazardType = {
	id: string;
	submission: string;
	hazard_form_history: hazardFormHistoryType;
	children: hazardChildType[];
	room?: roomDetailsType;
}

export type hazardChildType = {
	submission: string;
	id: string;
	hazard_form_child_history: hazardFormChildHistoryType;
}

export type hazardFormChildHistoryType = {
	form: string;
	version: string;
	hazard_form_child: hazardFormChildType;
}

export type hazardFormHistoryType = {
	form: string;
	version: string;
	hazard_form: hazardFormType;
}

export type hazardFormType = {
	id: string;
	form: string;
	version: string;
	hazard_category: hazardCategory;
	isSelected?: boolean;
	children?: hazardFormChildType[];
}

export type hazardFormChildType = {
	id: string;
	form: string;
	version: string;
	hazard_form_child_name: string;
	category?: string;
}

export type submissionForm = {
	id: string;
	submission: object;
	form?: object;
	children?: submissionForm[];
	formName?: string;
	room?: roomDetailsType;
	category?: string;
	comment?: string;
	tags?: hazardsAdditionalInfoHasTagType[];
}

export type hazLevelsType = {
	haz_type: hazType;
}

export type hazType = {
	haz_en: string;
}

export type roomType = {
	[key: string]: roomType | any;
};

type dispensationRequestRoomType = {
	id: number;
};

type dispensationRequestHolderType = {
	sciper: number;
};

export type dispensationRequestType = {
	subject: string;
	startDate: string;
	endDate: string;
	requirements: string;
	comment: string;
	rooms: dispensationRequestRoomType[];
	holders: dispensationRequestHolderType[];
};

export type tag = {
	tag_name: string;
}

export type hazardsAdditionalInfoHasTagType = {
	id: string;
	comment?: string;
	tag: tag;
}
