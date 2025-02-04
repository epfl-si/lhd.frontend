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
};

export type hazardReferencesType = {
	submission: string;
	hazards: hazardType;
}

export type hazardAdditionalInfoType = {
	comment?: string;
	modified_by?: string;
	modified_on?: string;
	hazard_category?: hazardCategory;
	file?: string;
	fileName?: string;
	filePath?: string;
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
