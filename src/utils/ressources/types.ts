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

type kindType = {
	name: string;
};

export type lhdUnitsType = {
	name: string;
	cosecs?: cosecsType[];
	professors?: professorsType[];
	institute?: instituteType;
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
};

type professorsType = {
	name: string;
};

type unitType = {
	name: string;
};

export type roomDetailsType = {
	id: number;
	name: string;
	kind?: kindType;
	vol?: number;
	vent?: string;
	lhd_units: lhdUnitsType[];
	yearly_audits?: number;
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
