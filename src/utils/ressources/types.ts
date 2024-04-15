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
	status?: 'New' | 'Deleted' | 'Default';
};

type instituteType = {
	name?: string;
	school?: schoolType;
}

type schoolType = {
	name?: string;
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
	hazards: hazardType[];
	lhd_units: lhdUnitsType[];
	haz_levels: hazLevelsType[];
	yearly_audits?: number;
	hazardsListName?: string[];
	status?: 'New' | 'Deleted' | 'Default';
};

export type hazardType = {
	id: string;
	submission: string;
	hazard_form_history: hazardFormHistoryType;
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
}

export type submissionForm = {
	id: string;
	submission: object;
	form?: object;
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
