import {
	hazardAdditionalInfoType,
	hazardFormChildType,
	hazardFormType,
	lhdUnitsFromAPIType,
	lhdUnitsType,
	profile,
	roomDetailsType
} from '../ressources/types';
import {doGraphQL} from "./Utils";
import {formatDateForPickers, getFormattedDate} from "../ressources/parser";

export const updateRoom = async (
	address: string | undefined,
	authToken: string | undefined,
	room: roomDetailsType
): Promise<any> => {
	const query = `mutation updateRoom {
							 updateRoom(
							 opLock: ${room.opLock},
							 name: "${room.name}",
							 kind: "${room.kind?.name}",
							 vent: "${room.vent ?? 'n'}",
							 labTypeIsDifferent: ${room.labTypeIsDifferent ?? false}
							 units: [${room.lhdUnits.map(u =>
								`{
									name: "${u.name}",
									status: "${u.status}"
								}`)}] )
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateUnit = async (
	address: string | undefined,
	authToken: string | undefined,
	details: {opLock: string, unit: string, profiles: profile[], subUnits: lhdUnitsType[]},
): Promise<any> => {
	const query = `mutation updateUnit {
							 updateUnit (
							 opLock: ${details.opLock}
							 unit: "${details.unit}"
							 profiles: [${details.profiles.map(profile => 
								`{
									status: "${profile.status}",
									role: "${profile.role}",
									${profile.expirationDate ? `expirationDate: "${formatDateForPickers(profile.expirationDate)}",` : ''}
									person: {
										name: "${profile.person.name}",
										surname: "${profile.person.surname}",
										sciper: ${profile.person.sciper},
										email: "${profile.person.email}"
									}
								}`)}]
								subUnits: [${details.subUnits.map(u =>
								`{
									name: "${u.name}",
									status: "${u.status}"
								}`)}])
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteUnit = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteUnit {
							 deleteUnit(opLock: ${id} )
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteRoom = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteRoom {
							 deleteRoom(opLock: ${id} )
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteOrganism = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteOrganism {
							 deleteOrganism(opLock: ${id} )
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteHazardChild = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteHazardChild {
							 deleteHazardChild(opLock: ${id} )
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteHazard = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteHazard {
							 deleteHazard(opLock: ${id} )
						}`;

	return doGraphQL(query, {}, address, authToken);
};


export const addHazard = async (
	address: string | undefined,
	authToken: string | undefined,
	submission: {},
	lastVersionForm: hazardFormType,
	room: string,
	additionalInfo: hazardAdditionalInfoType
): Promise<any> => {
	const query = `mutation addHazard {
							 addHazardToRoom(room: "${room}",
							 submission: ${JSON.stringify(JSON.stringify(submission))}, 
							 additionalInfo: {
							 	comment: "${additionalInfo.comment}",
							 },
							files: [
								${additionalInfo.hazardsAdditionalInfoHasFile.map(ass => `{status: "${ass.status ?? 'Default'}"${ass.base64 ? `, base64: "${ass.base64}"` : ''}${ass.filePath ? `, path: "${ass.filePath}"` : ''}}`)}
							],
							 category: "${lastVersionForm.hazardCategory.hazardCategoryName}")
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateFormHazard = async (
	address: string | undefined,
	authToken: string | undefined,
	hazardForm: hazardFormType,
): Promise<any> => {
	const query = `mutation updateFormHazard {
							 updateForm (
							 opLock: ${hazardForm.opLock},
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}",)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const createNewHazardCategory = async (
	address: string | undefined,
	authToken: string | undefined,
	hazardForm: hazardFormType,
): Promise<any> => {
	const query = `mutation createNewHazardCategory {
							 createNewHazardCategory (
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}",
							 hazardCategoryName: "${hazardForm.hazardCategory.hazardCategoryName}",)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewUnitsFromAPI = async (
	address: string | undefined,
	authToken: string | undefined,
	selectedUnits: lhdUnitsFromAPIType[],
): Promise<any> => {
	const query = `mutation saveNewUnitsFromAPI {
							 createUnit (
							 units: [${selectedUnits.map(u =>
								`{
									name: "${u.name}",
									unitId: ${u.unitId},
									path: "${u.path}"
									responsibleId: ${u.responsibleId},
									responsibleFirstName: "${u.responsibleFirstName}",
									responsibleLastName: "${u.responsibleLastName}",
									responsibleEmail: "${u.responsibleEmail}",
								}`)}])
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewRoomsFromAPI = async (
	address: string | undefined,
	authToken: string | undefined,
	selectedRooms: any[],
): Promise<any> => {
	const query = `mutation saveNewRoomsFromAPI {
							 createRoom (
							 rooms: [${selectedRooms.map(u =>
		`{
									name: "${u.name}",
									status: "${u.status}",
									floor: "${u.floor}",
									id: ${u.id},
									building: "${u.building}",
									sector: "${u.sector}",
									site: "${u.site}"
									vol: ${u.vol},
									facultyuse: "${u.facultyuse}"
								}`)}])
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const createNewHazardFormChild = async (
	address: string | undefined,
	authToken: string | undefined,
	hazardForm: hazardFormChildType,
): Promise<any> => {
	const query = `mutation createNewHazardFormChild {
							 createNewHazardFormChild (
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}",
							 hazardFormChildName: "${hazardForm.hazardFormChildName}",
							 category: "${hazardForm.category}")
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateHazardFormChild = async (
	address: string | undefined,
	authToken: string | undefined,
	hazardForm: hazardFormChildType,
): Promise<any> => {
	const query = `mutation updateHazardFormChild {
							 updateHazardFormChild (
							 opLock: ${hazardForm.opLock},
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}")
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewOrganism = async (
	address: string | undefined,
	authToken: string | undefined,
	organismName: string,
	risk: number,
	file: {name?: string, content?: string}
): Promise<any> => {
	const query = `
    mutation addOrganism(
      $organismName: String!
      $risk: Int!
      $fileContent: String
      $fileName: String
    ) {
      addOrganism(
        organismName: $organismName
        risk: $risk
        fileContent: $fileContent
        fileName: $fileName
      )
    }
  `;

	const variables = {
		organismName,
		risk,
		...(file.content && { fileContent: file.content }),
		...(file.name && { fileName: file.name }),
	};

	return doGraphQL(query, variables, address, authToken);
};

export const updateOrganism = async (
	address: string | undefined,
	authToken: string | undefined,
	opLock: string,
	organismName: string,
	risk: number,
	file: {name?: string, content?: string}
): Promise<any> => {
	const query = `
    mutation updateOrganism(
      $opLock: String!
      $organismName: String!
      $risk: Int!
      $fileContent: String
      $fileName: String
    ) {
      updateOrganism(
        opLock: $opLock
        organismName: $organismName
        risk: $risk
        fileContent: $fileContent
        fileName: $fileName
      )
    }
  `;

	const variables = {
		opLock,
		organismName,
		risk,
		...(file.content && { fileContent: file.content }),
		...(file.name && { fileName: file.name }),
	};

	return doGraphQL(query, variables, address, authToken);
};

export const saveNewChemical = async (
	address: string | undefined,
	authToken: string | undefined,
	cas: string,
	name: string,
	status: boolean,
	fastway: boolean,
	authcode: string
): Promise<any> => {
	const query = `mutation addChemical {
								addChemical(
								authChemEn: "${name}",
								casAuthChem: "${cas}",
								flagAuthChem: ${status},
								fastway: ${fastway},
								authCode: "${authcode}")
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateChemical = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	cas: string,
	name: string,
	status: boolean,
	fastway: boolean,
	authcode: string
): Promise<any> => {
	const query = `mutation updateChemical {
							 updateChemical(
								opLock: ${id},
								authChemEn: "${name}",
								casAuthChem: "${cas}",
								flagAuthChem: ${status},
								fastway: ${fastway},
								authCode: "${authcode}")
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteChemical = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteChemical {
							 deleteChemical(opLock: ${id})
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewRadioprotection = async (
	address: string | undefined,
	authToken: string | undefined,
	radioprotection: any
): Promise<any> => {
	const query = `mutation addRadioprotection {
								addAuthorization(
									idUnit: ${JSON.stringify(radioprotection.unit.opLock)},
									authorization: "${radioprotection.name}",
									creationDate: "${getFormattedDate(new Date(radioprotection.creationDate))}",
									expirationDate: "${getFormattedDate(new Date(radioprotection.expDate))}",
									status: "${radioprotection.status}",
									authority: "${radioprotection.authority}",
									type: "IonisingRadiation",
									radiations: [
										${radioprotection.selectedSources.map((auth: { source: string; status: string; }) => `{name: "${auth.source}", status: "${auth.status}"}`)}
									],
									holders: [
										${radioprotection.selectedHolders.map((auth: { sciper: string; status: string; }) => `{sciper: ${auth.sciper}, status: "${auth.status}"}`)}
									],
									rooms: [
										${radioprotection.selectedRooms.map((auth: { name: string; status: string; }) => `{name: "${auth.name}", status: "${auth.status}"}`)}
									],
									files: [
										${radioprotection.selectedFiles.map((ass: { filePath: string; status: string; base64: string; }) => `{path: "${ass.filePath}", status: "${ass.status ?? 'Default'}"${ass.base64 ? `, base64: "${ass.base64}"` : ''}}`)}
									],
								)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateRadioprotection = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	radioprotection: any
): Promise<any> => {
	const query = `mutation updateRadioprotection {
								updateAuthorization(
									opLock: ${id},
									idUnit: ${JSON.stringify(radioprotection.unit.opLock)},
									expirationDate: "${getFormattedDate(new Date(radioprotection.expDate))}",
									status: "${radioprotection.status}",
									authority: "${radioprotection.authority}",
									radiations: [
										${radioprotection.selectedSources.map((auth: { source: string; status: string; }) => `{name: "${auth.source}", status: "${auth.status}"}`)}
									],
									holders: [
										${radioprotection.selectedHolders.map((auth: { sciper: string; status: string; }) => `{sciper: ${auth.sciper}, status: "${auth.status}"}`)}
									],
									rooms: [
										${radioprotection.selectedRooms.map((auth: { name: string; status: string; }) => `{name: "${auth.name}", status: "${auth.status}"}`)}
									],
									files: [
										${radioprotection.selectedFiles.map((ass: { filePath: string; status: string; base64: string; }) => `{path: "${ass.filePath}", status: "${ass.status ?? 'Default'}"${ass.base64 ? `, base64: "${ass.base64}"` : ''}}`)}
									],
								)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteAuthorization = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteAuthorization {
							 deleteAuthorization(opLock: ${id})
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	dispensation: any
): Promise<any> => {
	const query = `mutation addDispensation {
								addDispensation(
									subject: "${dispensation.subject}",
									subjectOther: "${dispensation.other}",
									description: "${encodeURIComponent(dispensation.description)}",
									comment: "${encodeURIComponent(dispensation.comment)}",
									dateStart: "${getFormattedDate(new Date(dispensation.creationDate))}",
									dateEnd: "${getFormattedDate(new Date(dispensation.expDate))}",
									status: "${dispensation.status}",
									tickets: [
										${dispensation.selectedTickets.map((disp: { ticketNumber: string; status: string; }) => `{name: "${disp.ticketNumber}", status: "${disp.status}"}`)}
									],
									holders: [
										${dispensation.selectedHolders.map((disp: { sciper: string; status: string; }) => `{sciper: ${disp.sciper}, status: "${disp.status}"}`)}
									],
									rooms: [
										${dispensation.selectedRooms.map((disp: { name: string; status: string; }) => `{name: "${disp.name}", status: "${disp.status}"}`)}
									],
									units: [
										${dispensation.selectedUnits.map((disp: { name: string; status: string; }) => `{name: "${disp.name}", status: "${disp.status}"}`)}
									],
									files: [
										${dispensation.selectedFiles.map((ass: { filePath: string; status: string; base64: string; }) => `{path: "${ass.filePath}", status: "${ass.status ?? 'Default'}"${ass.base64 ? `, base64: "${ass.base64}"` : ''}}`)}
									],
								)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	dispensation: any
): Promise<any> => {
	const query = `mutation updateDispensation {
								updateDispensation(
									opLock: ${id},
									dateEnd: "${getFormattedDate(new Date(dispensation.expDate))}",
									status: "${dispensation.status}",
									subject: "${dispensation.subject}",
									subjectOther: "${dispensation.other}",
									description: "${encodeURIComponent(dispensation.description)}",
									comment: "${encodeURIComponent(dispensation.comment)}",
									tickets: [
										${dispensation.selectedTickets.map((disp: { ticketNumber: string; status: string; }) => `{name: "${disp.ticketNumber}", status: "${disp.status}"}`)}
									],
									holders: [
										${dispensation.selectedHolders.map((disp: { sciper: string; status: string; }) => `{sciper: ${disp.sciper}, status: "${disp.status}"}`)}
									],
									rooms: [
										${dispensation.selectedRooms.map((disp: { name: string; status: string; }) => `{name: "${disp.name}", status: "${disp.status}"}`)}
									],
									units: [
										${dispensation.selectedUnits.map((disp: { name: string; status: string; }) => `{name: "${disp.name}", status: "${disp.status}"}`)}
									],
									files: [
										${dispensation.selectedFiles.map((ass: { filePath: string; status: string; base64: string; }) => `{path: "${ass.filePath}", status: "${ass.status ?? 'Default'}"${ass.base64 ? `, base64: "${ass.base64}"` : ''}}`)}
									],
								)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteDispensation {
							 deleteDispensation(opLock: ${id})
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveTag = async (
	address: string | undefined,
	authToken: string | undefined,
	tag: string,
	comment: string,
	additionalInfoId: string,
	categoryName: string,
	roomId: string
): Promise<any> => {
	const query = `mutation addTag {
		addTag(
			tag: "${tag}",
			comment: "${comment}", 
			additionalInfoId: ${JSON.stringify(additionalInfoId)},
			categoryName: "${categoryName}", 
			roomId: ${JSON.stringify(roomId)}
		)
}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateTag = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	comment: string,
): Promise<any> => {
	const query = `mutation updateTag {
								updateTag(opLock: ${id}, comment: "${comment}")
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteTag = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string
): Promise<any> => {
	const query = `mutation deleteTag {
								deleteTag(opLock: ${id})
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewAssessment = async (
	address: string | undefined,
	authToken: string | undefined,
	assessment: any,
): Promise<any> => {
	const query = `mutation addAssessmentDecision {
								addAssessmentDecision (
									subject: "${assessment.subject}",
									subjectOther: "${assessment.other}",
									description: "${encodeURIComponent(assessment.description)}",
									conclusion: "${encodeURIComponent(assessment.conclusion)}",
									date: "${getFormattedDate(new Date(assessment.creationDate))}",
									status: "${assessment.status}",
									tickets: [
										${assessment.selectedTickets.map((ass: { ticketNumber: string; status: string; }) => `{name: "${ass.ticketNumber}", status: "${ass.status}"}`)}
									],
									contacts: [
										${assessment.selectedContacts.map((ass: { sciper: string; status: string; }) => `{sciper: ${ass.sciper}, status: "${ass.status}"}`)}
									],
									rooms: [
										${assessment.selectedRooms.map((ass: { name: string; status: string; }) => `{name: "${ass.name}", status: "${ass.status}"}`)}
									],
									units: [
										${assessment.selectedUnits.map((ass: { name: string; status: string; }) => `{name: "${ass.name}", status: "${ass.status}"}`)}
									],
									files: [
										${assessment.selectedFiles.map((ass: { filePath: string; status: string; base64: string; }) => `{path: "${ass.filePath}", status: "${ass.status ?? 'Default'}"${ass.base64 ? `, base64: "${ass.base64}"` : ''}}`)}
									],
								)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateAssessment = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	assessment: any,
): Promise<any> => {
	const query = `mutation updateAssessmentDecision {
								updateAssessmentDecision (
									opLock: ${id},
									date: "${getFormattedDate(new Date(assessment.creationDate))}",
									status: "${assessment.status}",
									subject: "${assessment.subject}",
									subjectOther: "${assessment.other}",
									description: "${encodeURIComponent(assessment.description)}",
									conclusion: "${encodeURIComponent(assessment.conclusion)}",
									tickets: [
										${assessment.selectedTickets.map((ass: { ticketNumber: string; status: string; }) => `{name: "${ass.ticketNumber}", status: "${ass.status}"}`)}
									],
									contacts: [
										${assessment.selectedContacts.map((ass: { sciper: string; status: string; }) => `{sciper: ${ass.sciper}, status: "${ass.status}"}`)}
									],
									rooms: [
										${assessment.selectedRooms.map((ass: { name: string; status: string; }) => `{name: "${ass.name}", status: "${ass.status}"}`)}
									],
									units: [
										${assessment.selectedUnits.map((ass: { name: string; status: string; }) => `{name: "${ass.name}", status: "${ass.status}"}`)}
									],
									files: [
										${assessment.selectedFiles.map((ass: { filePath: string; status: string; base64: string; }) => `{path: "${ass.filePath}", status: "${ass.status ?? 'Default'}"${ass.base64 ? `, base64: "${ass.base64}"` : ''}}`)}
									],
								)
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteAssessment = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteAssessmentDecision {
							 deleteAssessmentDecision (opLock: ${id})
						}`;

	return doGraphQL(query, {}, address, authToken);
};
