import {
	dispensationRequestType,
	hazardAdditionalInfoType,
	hazardFormChildType,
	hazardFormType,
	lhdUnitsFromAPIType,
	lhdUnitsType,
	personType,
	roomDetailsType
} from '../ressources/types';
import {doGraphQL} from "./Utils";

export const createDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	dispensation: dispensationRequestType,
	variables: Object
): Promise<any> => {
	const operationName = 'newDispensation';
	const results =
		typeof address === 'string'
			? await fetch(address, {
					headers: {
						accept: '*/*',
						'content-type': 'application/json',
						'sec-fetch-dest': 'empty',
						'sec-fetch-mode': 'cors',
						'sec-fetch-site': 'cross-site',
						authorization: `Bearer ${authToken}`,
					},
					referrerPolicy: 'no-referrer-when-downgrade',
					body: JSON.stringify({
						query: `mutation ${operationName} {
							createDispensation(subject: "${
								dispensation.subject
							}", author: "${'TEST'}", sciper_author: 312067, description: "${
							escapeGraphQL(dispensation.requirements)
						}", comment: "${escapeGraphQL(dispensation.comment)}", date_start: "${
							dispensation.startDate
						}", date_end: "${dispensation.endDate}", rooms: ${
							dispensation.rooms
						}, holders: ${dispensation.holders}) {
								errors {
									message
								}
								isSuccess
								slug
							}
						}`,
						variables,
					}),
					method: 'POST',
					mode: 'cors',
					credentials: 'omit',
				})
			: null;

	if (results?.status !== 200) {
		return { status: results?.status, data: await results?.text() };
	}

	const graphQLResponse = await results.json();

	return {
		status: results.status,
		data: graphQLResponse.data,
	};
};

const escapeGraphQL = (unquotedString: string): string => {
	return unquotedString
		.replaceAll(/("|\\)/g, '\\$1')
		.replaceAll(/\n/g, '\\n')
}

export const updateRoom = async (
	address: string | undefined,
	authToken: string | undefined,
	room: roomDetailsType
): Promise<any> => {
	const query = `mutation updateRoom {
							 updateRoom(
							 id: ${room.id},
							 name: "${room.name}",
							 kind: "${room.kind?.name}",
							 vent: "${room.vent ?? 'n'}",
							 lab_type_is_different: ${room.lab_type_is_different}
							 units: [${room.lhd_units.map(u =>
								`{
									name: "${u.name}",
									status: "${u.status}"
								}`)}] ) {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateUnit = async (
	address: string | undefined,
	authToken: string | undefined,
	details: {id: string, unit: string, profs: personType[], cosecs: personType[], subUnits: lhdUnitsType[]},
): Promise<any> => {
	const query = `mutation updateUnit {
							 updateUnit (
							 id: ${details.id}
							 unit: "${details.unit}"
							 profs: [${details.profs.map(prof => 
								`{
									status: "${prof.status}",
									person: {
										name: "${prof.name}",
										surname: "${prof.surname}",
										sciper: ${prof.sciper},
										email: "${prof.email}"
									}
								}`)}]
							 cosecs: [${details.cosecs.map(cosec =>
								`{
									status: "${cosec.status}",
									person: {
										name: "${cosec.name}",
										surname: "${cosec.surname}",
										sciper: ${cosec.sciper},
										email: "${cosec.email}"
									}
								}`)}]
								subUnits: [${details.subUnits.map(u =>
								`{
									name: "${u.name}",
									status: "${u.status}"
								}`)}]) {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteUnit = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteUnit {
							 deleteUnit(id: ${id} )
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteRoom = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteRoom {
							 deleteRoom(id: ${id} )
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteOrganism = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteOrganism {
							 deleteOrganism(id: ${id} )
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteHazardChild = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteHazardChild {
							 deleteHazardChild(id: ${id} )
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteHazard = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteHazard {
							 deleteHazard(id: ${id} )
							 {
								errors {
									message
								}
								isSuccess
							}
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
							 	file: "${additionalInfo.file ?? ''}",
							 	fileName: "${additionalInfo.fileName ?? ''}"
							 }
							 category: "${lastVersionForm.hazard_category.hazard_category_name}")
							 {
								errors {
									message
								}
								isSuccess
							}
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
							 id: ${hazardForm.id},
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}",
							 hazard_category_name: "${hazardForm.hazard_category.hazard_category_name}",) {
								errors {
									message
								}
								isSuccess
							}
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
							 id: ${hazardForm.id},
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}",
							 hazard_category_name: "${hazardForm.hazard_category.hazard_category_name}",) {
								errors {
									message
								}
								isSuccess
							}
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
									status: "${u.status}",
									unitId: ${u.unitId},
									path: "${u.path}"
									responsibleId: ${u.responsibleId},
									responsibleFirstName: "${u.responsibleFirstName}",
									responsibleLastName: "${u.responsibleLastName}",
									responsibleEmail: "${u.responsibleEmail}",
								}`)}]) {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewRoomsFromAPI = async (
	address: string | undefined,
	authToken: string | undefined,
	selectedRooms: roomDetailsType[],
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
								}`)}]) {
								errors {
									message
								}
								isSuccess
							}
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
							 id: ${hazardForm.id},
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}",
							 hazard_form_child_name: "${hazardForm.hazard_form_child_name}",
							 category: "${hazardForm.category}") {
								errors {
									message
								}
								isSuccess
							}
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
							 id: ${hazardForm.id},
							 form: ${hazardForm.form},
							 version: "${hazardForm.version}",
							 hazard_form_child_name: "${hazardForm.hazard_form_child_name}") {
								errors {
									message
								}
								isSuccess
							}
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
	const query = `mutation addOrganism {
							 addOrganism(organismName: "${organismName}",
								risk: ${risk},
								fileContent: "${file.content ?? ''}",
								fileName: "${file.name ?? ''}")
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;
	return doGraphQL(query, {}, address, authToken);
};

export const updateOrganism = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	organismName: string,
	risk: number,
	file: {name?: string, content?: string}
): Promise<any> => {
	const query = `mutation updateOrganism {
							 updateOrganism(id: ${id},
								organismName: "${organismName}",
								risk: ${risk},
								fileContent: "${file.content ?? ''}",
								fileName: "${file.name ?? ''}")
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;
	return doGraphQL(query, {}, address, authToken);
};

export const saveNewChemical = async (
	address: string | undefined,
	authToken: string | undefined,
	cas: string,
	name: string,
	status: boolean
): Promise<any> => {
	const query = `mutation addChemical {
								addChemical(auth_chem_en: "${name}",
								cas_auth_chem: "${cas}",
								flag_auth_chem: ${status})
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateChemical = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	cas: string,
	name: string,
	status: boolean
): Promise<any> => {
	const query = `mutation updateChemical {
							 updateChemical(id: ${id},
								auth_chem_en: "${name}",
								cas_auth_chem: "${cas}",
								flag_auth_chem: ${status})
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteChemical = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteChemical {
							 deleteChemical(id: ${id})
							 {
								errors {
									message
								}
								isSuccess
							}
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
									id_unit: ${JSON.stringify(radioprotection.unit.id)},
									authorization: "${radioprotection.name}",
									creation_date: "${(new Date(radioprotection.creationDate)).toLocaleDateString("en-GB")}",
									expiration_date: "${(new Date(radioprotection.expDate)).toLocaleDateString("en-GB")}",
									status: "${radioprotection.status}",
									authority: "${radioprotection.authority}",
									type: "IonisingRadiation",
									radiations: [
										${radioprotection.selectedSources.map(auth => `{name: "${auth.source}", status: "${auth.status}"}`)}
									],
									holders: [
										${radioprotection.selectedHolders.map(auth => `{sciper: ${auth.sciper}, status: "${auth.status}"}`)}
									],
									rooms: [
										${radioprotection.selectedRooms.map(auth => `{name: "${auth.name}", status: "${auth.status}"}`)}
									],
								)
							 {
								errors {
									message
								}
								isSuccess
							}
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
									id: ${id},
									id_unit: ${JSON.stringify(radioprotection.unit.id)},
									expiration_date: "${(new Date(radioprotection.expDate)).toLocaleDateString("en-GB")}",
									status: "${radioprotection.status}",
									authority: "${radioprotection.authority}",
									radiations: [
										${radioprotection.selectedSources.map(auth => `{name: "${auth.source}", status: "${auth.status}"}`)}
									],
									holders: [
										${radioprotection.selectedHolders.map(auth => `{sciper: ${auth.sciper}, status: "${auth.status}"}`)}
									],
									rooms: [
										${radioprotection.selectedRooms.map(auth => `{name: "${auth.name}", status: "${auth.status}"}`)}
									],
								)
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteAuthorization = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteAuthorization {
							 deleteAuthorization(id: ${id})
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveNewDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	dispensation: any,
	fileToSend: { file: string; fileName: string | undefined; }
): Promise<any> => {
	const query = `mutation addDispensation {
								addDispensation(
									dispensation: "${dispensation.name}",
									subject: "${dispensation.subject}",
									other_subject: "${dispensation.other}",
									requires: "${encodeURIComponent(dispensation.requires)}",
									comment: "${encodeURIComponent(dispensation.comment)}",
									file: "${fileToSend.file ?? ''}",
									file_name: "${fileToSend.fileName ?? ''}",
									date_start: "${(new Date(dispensation.creationDate)).toLocaleDateString("en-GB")}",
									date_end: "${(new Date(dispensation.expDate)).toLocaleDateString("en-GB")}",
									status: "${dispensation.status}",
									tickets: [
										${dispensation.selectedTickets.map(disp => `{name: "${disp.ticket_number}", status: "${disp.status}"}`)}
									],
									holders: [
										${dispensation.selectedHolders.map(disp => `{sciper: ${disp.sciper}, status: "${disp.status}"}`)}
									],
									rooms: [
										${dispensation.selectedRooms.map(disp => `{name: "${disp.name}", status: "${disp.status}"}`)}
									],
								)
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const updateDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	dispensation: any,
	fileToSend: { file: string; fileName: string | undefined; }
): Promise<any> => {
	const query = `mutation updateDispensation {
								updateDispensation(
									id: ${id},
									date_end: "${(new Date(dispensation.expDate)).toLocaleDateString("en-GB")}",
									status: "${dispensation.status}",
									subject: "${dispensation.subject}",
									other_subject: "${dispensation.other}",
									requires: "${encodeURIComponent(dispensation.requires)}",
									comment: "${encodeURIComponent(dispensation.comment)}",
									file: "${fileToSend.file ?? ''}",
									file_name: "${fileToSend.fileName ?? ''}",
									tickets: [
										${dispensation.selectedTickets.map(disp => `{name: "${disp.ticket_number}", status: "${disp.status}"}`)}
									],
									holders: [
										${dispensation.selectedHolders.map(disp => `{sciper: ${disp.sciper}, status: "${disp.status}"}`)}
									],
									rooms: [
										${dispensation.selectedRooms.map(disp => `{name: "${disp.name}", status: "${disp.status}"}`)}
									],
								)
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
): Promise<any> => {
	const query = `mutation deleteDispensation {
							 deleteDispensation(id: ${id})
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const saveTag = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string,
	tag: string,
	comment: string,
	additionalInfoId: string
): Promise<any> => {
	const query = `mutation addTag {
								addTag(id: ${JSON.stringify(id)}, tag: "${tag}",
								comment: "${comment}", additionalInfoId: ${JSON.stringify(additionalInfoId)})
							 {
								errors {
									message
								}
								isSuccess
							}
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
								updateTag(id: ${id}, comment: "${comment}")
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};

export const deleteTag = async (
	address: string | undefined,
	authToken: string | undefined,
	id: string
): Promise<any> => {
	const query = `mutation deleteTag {
								deleteTag(id: ${id})
							 {
								errors {
									message
								}
								isSuccess
							}
						}`;

	return doGraphQL(query, {}, address, authToken);
};
