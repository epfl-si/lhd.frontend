export type notificationType = {
	type: string;
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
	occupancies: occupanciesType[];
	yearly_audits?: number;
};
