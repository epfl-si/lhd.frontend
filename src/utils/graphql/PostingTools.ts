import {
	dispensationRequestType, hazardAdditionalInfoType, hazardFormChildType,
	hazardFormType,
	lhdUnitsFromAPIType,
	lhdUnitsType,
	personType,
	roomDetailsType
} from '../ressources/types';
import {makeQuery} from "./Utils";

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

export const deleteDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	slug: string | null,
	variables: Object
): Promise<any> => {
	const operationName = 'deleteDispensation';
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
              				deleteDispensation(slug: "${slug}") {
								errors {
									message
									extensions {
										code
									}
								}
								isSuccess
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

export const updateDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	slug: string | null,
	dispensation: dispensationRequestType,
	variables: Object
): Promise<any> => {
	const operationName = 'updateDispensation';
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
               editDraftDispensation(slug: "${slug}", author: "${'TEST'}", sciper_author: 312067, subject: "${
							dispensation.subject
						}", description: "${escapeGraphQL(dispensation.requirements)}", comment: "${
							escapeGraphQL(dispensation.comment)
						}", date_start: "${dispensation.startDate}", date_end: "${
							dispensation.endDate
						}", rooms: ${dispensation.rooms}, holders: ${dispensation.holders}) {
                errors {
                  message
                }
                isSuccess
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
							 vol: ${room.vol},
							 vent: "${room.vent}",
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

	return makeQuery(query, {}, address, authToken);
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

	return makeQuery(query, {}, address, authToken);
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

	return makeQuery(query, {}, address, authToken);
};

export const addHazard = async (
	address: string | undefined,
	authToken: string | undefined,
	submission: string,
	lastVersionForm: hazardFormType,
	room: string,
	additionalInfo: hazardAdditionalInfoType
): Promise<any> => {
	const query = `mutation addHazard {
               addHazardToRoom(room: "${room}", 
               submission: "${submission}", 
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

	return makeQuery(query, {}, address, authToken);
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

	return makeQuery(query, {}, address, authToken);
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

	return makeQuery(query, {}, address, authToken);
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
								}`)}]) {
                errors {
                  message
                }
                isSuccess
              }
            }`;

	return makeQuery(query, {}, address, authToken);
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
								}`)}]) {
                errors {
                  message
                }
                isSuccess
              }
            }`;

	return makeQuery(query, {}, address, authToken);
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

	return makeQuery(query, {}, address, authToken);
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

	return makeQuery(query, {}, address, authToken);
};
