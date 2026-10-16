import { AlertColor } from '@mui/material';

export type UserInfo = {
	groups: string[];
	username: string;
	isAdmin?: boolean;
	isCosec?: boolean;
	isManager?: boolean;
	canEditHazards?: boolean;
	canEditRooms?: boolean;
	canListUnits?: boolean;
	canListHazards?: boolean;
	canListRooms?: boolean;
	canListReportFiles?: boolean;
	canEditUnits ?: boolean;
	canListOrganisms?: boolean;
	canEditOrganisms?: boolean;
	canListChemicals?: boolean;
	canEditChemicals?: boolean;
	canListAuthorizations?: boolean;
	canEditAuthorizations?: boolean;
	canListDispensations?: boolean;
	canEditDispensations?: boolean;
	canListAssessments?: boolean;
	canEditAssessments?: boolean;
	canListPeople?: boolean;
	canListForms?: boolean;
	canListLogs?: boolean;
};

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
	hazardCategoryName: string;
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
	opLock: string;
	organism: string;
	riskGroup: number;
	filePath: string;
	updatedOn: Date;
	updatedBy: string;
}

export type chemicalsType = {
	opLock: string;
	casAuthChem: string;
	authChemEn: string;
	flagAuthChem: boolean;
	authCode: string;
	fastway: boolean;
}

export type authorizationType = {
	opLock: string;
	authorization: string;
	expirationDate: Date;
	status: string;
	creationDate: Date;
	renewals: number;
	type: string;
	unit: lhdUnitsType;
	authorizationRooms: roomDetailsType[];
	authorizationHolders: personType[];
	authorizationFiles: genericType[];
	authorizationChemicals: chemicalsType[];
	authorizationRadiations: genericType[];
	authority?: string;
}

export type dispensationType = {
	opLock: string;
	dispensation: string;
	renewals: number;
	subjectOther: string;
	description: string;
	comment: string;
	status: string;
	dateStart: Date;
	dateEnd: Date;
	createdBy: string;
	createdOn: Date;
	modifiedBy: string;
	modifiedOn: Date;
	subject: string;
	dispensationRooms: roomDetailsType[];
	dispensationUnits: lhdUnitsType[];
	dispensationHolders: personType[];
	dispensationTickets: genericType[];
	dispensationFiles: genericType[];
}

export type assessmentType = {
	opLock: string;
	assessment: string;
	subjectOther: string;
	description: string;
	conclusion: string;
	status: string;
	date: Date;
	createdBy: string;
	createdOn: Date;
	modifiedBy: string;
	modifiedOn: Date;
	subject: string;
	assessmentRooms: roomDetailsType[];
	assessmentUnits: lhdUnitsType[];
	assessmentContacts: personType[];
	assessmentTickets: genericType[];
	assessmentFiles: genericType[];
}

export type lhdUnitsType = {
	name: string;
	unitId?: number;
	opLock: string;
	profiles: profile[];
	subUnits: lhdUnitsType[];
	institute?: instituteType;
	responsible?: responsible;
	unitType: string;
	status?: 'New' | 'Deleted' | 'Default';
};

export type profile = {
	role: string;
	expirationDate?: Date;
	person: personType;
	unit: lhdUnitsType;
	status?: 'New' | 'Deleted' | 'Default';
}

export type genericType = {
	filePath?: string;
	base64?: string;
	source?: string;
	ticketNumber?: string;
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
	opLock: string;
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
	labDisplay: string,
	hazardCategoryName: string,
	parentSubmission: string,
	childSubmission: string,
	idLabHasHazardsChild: string,
	idLabHasHazards: number
	globalComment?: string,
	modifiedBy?: string,
	modifiedOn?: Date,
	tags?: string
}

export type roomDetailsType = {
	opLock: string,
	name: string;
	building?: string;
	sector?: string;
	floor?: string;
	kind?: kindType;
	vol?: number;
	vent?: string;
	adminuse?: string;
	facultyuse?: string;
	labTypeIsDifferent?: boolean;
	site?: string;
	hazards: hazardType[];
	hazardAdditionalInfo?: hazardAdditionalInfoType[];
	hazardReferences?: hazardReferencesType[]
	lhdUnits: lhdUnitsType[];
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
	opLock?: string;
	comment?: string;
	modifiedBy?: string;
	modifiedOn?: string;
	hazardCategory?: hazardCategory;
	hazardsAdditionalInfoHasTag?: hazardsAdditionalInfoHasTagType[];
	hazardsAdditionalInfoHasFile: genericType[];
}

export type hazardType = {
	opLock: string;
	submission: string;
	hazardFormHistory: hazardFormHistoryType;
	children: hazardChildType[];
	room?: roomDetailsType;
}

export type hazardChildType = {
	submission: string;
	opLock: string;
	hazardFormChildHistory: hazardFormChildHistoryType;
}

export type hazardFormChildHistoryType = {
	form: string;
	version: string;
	hazardFormChild: hazardFormChildType;
}

export type hazardFormHistoryType = {
	form: string;
	version: string;
	hazardForm: hazardFormType;
}

export type hazardFormType = {
	opLock?: string;
	form: string;
	version: string;
	hazardCategory: hazardCategory;
	isSelected?: boolean;
	children?: hazardFormChildType[];
}

export type hazardFormChildType = {
	opLock?: string;
	form: string;
	version: string;
	hazardFormChildName: string;
	category?: string;
}

export type submissionForm = {
	opLock: string;
	submission: any;
	form?: object;
	children?: submissionForm[];
	formName?: string;
	room?: roomDetailsType;
	category?: string;
	comment?: string;
	tags?: hazardsAdditionalInfoHasTagType[];
}

export type roomType = {
	[key: string]: roomType | any;
};

export type tag = {
	tagName: string;
}

export type hazardsAdditionalInfoHasTagType = {
	opLock: string;
	comment?: string;
	tag: tag;
}

export interface OptionType {
	title: string;
	encodedTitle: string;
}
