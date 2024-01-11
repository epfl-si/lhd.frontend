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

export type lhdUnitsType = {
	name: string;
	unitId?: number;
	id: number;
	cosecs: personType[];
	professors: personType[];
	institute?: instituteType;
};

export type lhdUnitsSimpleType = {
	name: string;
	unitId: number;
};

type instituteType = {
	name?: string;
	school?: schoolType;
}

type schoolType = {
	name?: string;
}

type occupanciesType = {
	cosecs?: cosecsType[];
	professors?: professorsType[];
	unit?: unitType;
};

type cosecsType = {
	name: string;
	surname: string;
};

type professorsType = {
	name: string;
	surname: string;
};

export type personType = {
	name: string;
	surname: string;
	sciper: number;
	status?: 'New' | 'Deleted' | 'Default';
};

type unitType = {
	name: string;
};

export type roomDetailsType = {
	name: string;
	kind?: kindType;
	vol?: number;
	vent?: string;
	lhd_units: lhdUnitsType[];
	yearly_audits?: number;
};

export type roomDetailsForSaveType = {
	name: string;
	kind?: string;
	vol?: number;
	vent?: string;
	lhd_units: number[];
};

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
