import {
	hazardDetailsType,
	kindType,
	lhdUnitsType,
	organismType,
	reportFile,
	roomDetailsType,
	roomType
} from '../ressources/types';
import {formatDataToColumns} from './ParsingTools';
import {doGraphQL} from "./Utils";

type fetchResultsType = {
	status?: number;
	data?: Object[] | string;
};

type fetchRoomResultsType = {
	status?: number;
	data?: roomDetailsType[] | string;
	errors?: any;
};

type fetchRoomResultsTypeWithPagination = {
	status?: number;
	data?: roomsWithPaginationType;
	errors?: any;
};

type fetchHazardsResultsTypeWithPagination = {
	status?: number;
	data?: hazardsWithPaginationType;
	errors?: any;
};

type hazardsWithPaginationType = {
	hazards: hazardDetailsType[];
	totalCount: number;
};

type roomsWithPaginationType = {
	rooms: roomDetailsType[];
	totalCount: number;
};

type fetchKindRoomType = {
	status?: number;
	data?: kindType[] | string;
	errors?: any;
};

type fetchUnitsType = {
	status?: number;
	data?: lhdUnitsType[] | string;
	errors?: any;
};

type fetchUnitsTypeWithPagination = {
	status?: number;
	data?: unitsWithPaginationType;
	errors?: any;
};

type fetchOrganismsTypeWithPagination = {
	status?: number;
	data?: organismType[];
};

type fetchReportFiles = {
	status?: number;
	data?: reportFile[];
	errors?: any;
};

type unitsWithPaginationType = {
	units: lhdUnitsType[];
	totalCount: number;
};

type fetchFormsType = {
	status?: number;
	data?: string; //TODO
};

export const fetchResults = async (
	address: string | undefined,
	authToken: string | undefined,
	graphqlBody: string,
	variables: Object
): Promise<fetchResultsType> => {
	const operationName = 'AppTableFetch';
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
						query: `query ${operationName} { ${graphqlBody} }`,
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
		data: graphQLResponse.data?.rooms.map((room: roomType, index: number) =>
			formatDataToColumns(graphqlBody, room, index)
		),
	};
};

export const fetchRoomDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	room: string | null,
	variables: Object
): Promise<fetchRoomResultsType> => {
	const query: string = `query SingleRoomFetch { 
				rooms (where: { name: { equals: "${room}"}, isDeleted: { equals: false } }) {
				id
					name
					building
					sector
					floor
					vol
					adminuse
					facultyuse
					lab_type_is_different
					site
					assignedTo
					kind {
						name
					}
					hazards {
						id
						submission
						children {
							submission
							hazard_form_child_history {
								form
								version
								hazard_form_child {
									id
									form
									version
									hazard_form_child_name
								}
							}
							id
						}
						hazard_form_history {
							form
							hazard_form {
								form
								version
								hazard_category {
									hazard_category_name
								}
							}
						}
					}
					hazardAdditionalInfo {
						id
						comment
						filePath
						modified_by
						modified_on
						hazard_category {
							hazard_category_name
						}
						hazardsAdditionalInfoHasTag {
							id
							comment
							tag {
								tag_name
							}
						}
					}
					lhd_units {
						id
						unitId
						name
						institute {
							name
							school {
								name
							}
						}
						cosecs {
							name
							surname
						}
						professors {
							name
							surname
						}
					}
				},
			}`;

	const result = await doGraphQL(query, variables, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
		errors: result.errors
	};
};

export const fetchHazardsInRoom = async (
	address: string | undefined,
	authToken: string | undefined,
	room: string | null
): Promise<fetchRoomResultsType> => {
	const query: string = `query fetchHazardsInRoom { 
				rooms (where: { name: { equals: "${room}"} }) {
					name
					hazards {
						id
						submission
						hazard_form_history {
							form
							hazard_form {
								form
								version
								hazard_category {
									hazard_category_name
								}
							}
						}
					}
				},
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
		errors: result.errors
	};
};

export const fetchUnitDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	unit: string | null,
	variables: Object
): Promise<fetchUnitsType> => {
	const query: string = `query SingleUnitFetch { 
						units (where: {name: { equals: "${unit}"} }) {
							id
							unitId
								name
								responsible {
									sciper
								}
								unitType
								institute {
									name
									school {
										name
									}
								}
								cosecs {
									name
									surname
									sciper
									email
								}
								professors {
									name
									surname
									sciper
									email
								}
								subUnits {
									name
								}
						},
					}`;

	const result = await doGraphQL(query, variables, address, authToken);
	return {
		status: result.status,
		data: result.data?.units,
		errors: result.errors
	};
};

export const fetchRoomTypes = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<fetchKindRoomType> => {
	const query: string = `query KindRoomFetch { 
						roomKinds {
							name
						}
					}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomKinds,
		errors: result.errors
	};
};

export const fetchUnits = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<fetchUnitsType> => {
	const query: string = `query UnitFetch { 
						units {
							name
							unitId
							id
							institute {
								name
								school {
									name
								}
							}
							cosecs {
								name
								surname
							}
							professors {
								name
								surname
							}
						}
					}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.units,
		errors: result.errors
	};
};

export const fetchUnitsForDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	rooms: string[]
): Promise<any> => {
	const query: string = `query fetchUnitsForDispensation { 
						unitsForDispensation (rooms: "${rooms.join(',')}") {
							name
							id
						}
					}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitsForDispensation,
		errors: result.errors
	};
};

export const fetchRooms = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string
): Promise<fetchRoomResultsTypeWithPagination> => {
	const query: string = `query RoomFetch { 
				roomsWithPagination (take: ${take}, skip: ${skip}, search: "${search}") {
					rooms {
						id
						name
						building
						sector
						floor
						vol
						site
						kind {
							name
						}
						hazardAdditionalInfo {
							comment
							hazard_category {
								hazard_category_name
							}
						}
						hazards {
							hazard_form_history {
								hazard_form {
									hazard_category {
										hazard_category_name
									}
								}
							}
						}
						lhd_units {
							id
							unitId
							name
							institute {
								name
								school {
									name
								}
							}
							cosecs {
								name
								surname
								email
							}
							professors {
								name
								surname
								email
							}
						}
					}
					totalCount
				},
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomsWithPagination,
		errors: result.errors
	};
};

export const fetchRoomsWithHazards = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string
): Promise<fetchRoomResultsTypeWithPagination> => {
	const query: string = `query RoomFetch { 
				roomsWithPagination (take: ${take}, skip: ${skip}, search: "${search}") {
					rooms {
						id
						name
						building
						sector
						floor
						vol
						site
						kind {
							name
						}
						hazardAdditionalInfo {
							comment
							hazard_category {
								hazard_category_name
							}
						}
						hazards {
							submission
							children {
								submission
							}
							hazard_form_history {
								hazard_form {
									hazard_category {
										hazard_category_name
									}
								}
							}
						}
						lhd_units {
							id
							unitId
							name
							institute {
								name
								school {
									name
								}
							}
							cosecs {
								name
								surname
								email
							}
							professors {
								name
								surname
								email
							}
						}
					}
					totalCount
				},
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomsWithPagination,
		errors: result.errors
	};
};

export const fetchRoomsForDropDownComponent = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<fetchRoomResultsType> => {
	const query: string = `query RoomFetch { 
				rooms {
					name
				}
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
		errors: result.errors
	};
};

export const fetchOtherRoomsForStaticMagneticField = async (
	address: string | undefined,
	authToken: string | undefined,
	roomName: string
): Promise<fetchRoomResultsType> => {
	const query: string = `query OtherRoomsFetch { 
			rooms (where: {name: {equals: "${roomName}"}}) {
					name
					hazardReferences {
					submission
						hazards {
							room {
								name
							}
							hazard_form_history {
								hazard_form {
									hazard_category {
										hazard_category_name
									}
								}
							}
						}
					}
				}
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
		errors: result.errors
	};
};

export const fetchunitsFromFullTextAndPagination = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string
): Promise<fetchUnitsTypeWithPagination> => {
	const query: string = `query UnitFetchFromFullText { 
						unitsFromFullTextAndPagination(take: ${take}, skip: ${skip}, search: "${search}") {
							units {
								name
								unitId
								id
								institute {
									name
									school {
										name
									}
								}
								cosecs {
									name
									surname
								}
								professors {
									name
									surname
								}
							}
							totalCount
						}
					}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitsFromFullTextAndPagination,
		errors: result.errors
	};
};

export const fetchunitsFromFullText = async (
	address: string | undefined,
	authToken: string | undefined,
	search: string
): Promise<fetchUnitsTypeWithPagination> => {
	const query: string = `query UnitFetchFromFullText { 
						unitsFromFullText(search: "${search}") {
								name
								unitId
								id
								institute {
									name
									school {
										name
									}
								}
								cosecs {
									name
									surname
								}
								professors {
									name
									surname
								}
						}
					}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitsFromFullText,
		errors: result.errors
	};
};

export const fetchSlugs = async (
	address: string | undefined,
	authToken: string | undefined,
	variables: Object
): Promise<any> => {
	const query = `query getSlugs {
							dispensations {
								slug
							}
						}`;

	const result = await doGraphQL(query, variables, address, authToken);
	return {
		status: result.status,
		data: result.data?.dispensations,
		errors: result.errors
	};
};

export const fetchDispFormDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	variables: Object
): Promise<any> => {
	const query = `query getDispensationFormDetails {
							rooms {
								name
							}
							people {
								name
								sciper
							}
						}`;
	return await doGraphQL(query, variables, address, authToken);
};

export const fetchSingleDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	slug: string | null,
	variables: Object
): Promise<any> => {
	const query = `query SingleDispensationFetch { 
							dispensations (where: { slug: { contains: "${slug}" }}) {
								versions {
									subject
									date_start
									date_end
									description
									comment
									rooms {
										name
									}
									holders {
										name
										sciper
									}
								}
								},
							}`;

	const result = await doGraphQL(query, variables, address, authToken);
	const version = result.data?.dispensations[0]?.versions;

	return {
		status: result.status,
		data: version[version.length-1],
		errors: result.errors
	};
};

export const fetchPeopleFromFullText = async (
	address: string | undefined,
	authToken: string | undefined,
	fullText: string | null
): Promise<any> => {
	const query = `query FullTextTest {
				personFullText(search:"${fullText}") {
					... on DirectoryPerson { name surname email sciper type}
					... on Person { name surname email sciper type}
				}
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.personFullText,
		errors: result.errors
	};
};

export const fetchHazardForms = async (
	address: string | undefined,
	authToken: string | undefined,
): Promise<any> => {
	const query = `query fetchHazardForms {
				hazardForms {
					id
					form
					version
					hazard_category {
						hazard_category_name
					}
					children {
						id
						form
						version
						hazard_form_child_name
					}
				}
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardForms,
		errors: result.errors
	};
};

export const fetchHazardFormDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	categoryName: string
): Promise<any> => {
	const query = `query fetchHazardFormDetails {
				hazardForms (where: { hazard_category: {hazard_category_name:	{ contains: "${categoryName}" }}}) {
					id
					form
					version
					hazard_category {
						hazard_category_name
					}
					children {
						version
						hazard_form_child_name
					}
				}
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardForms,
		errors: result.errors
	};
};

export const fetchConnectedUser = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<any> => {
	const query = `query connection {
						connectedUserInfo {
							groups
							userName
							canEditHazards
							canEditRooms
							canListUnits
							canListHazards
							canListRooms
							isAdmin
							canEditUnits
							canListReportFiles
							canListOrganisms
							canEditOrganisms
							canListChemicals
							canEditChemicals
							canListAuthorizations
							canEditAuthorizations
							canListDispensations
							canEditDispensations
							canListPersons
							canListForms
						}
					}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.connectedUserInfo,
		errors: result.errors
	};
};

export const fetchUnitsFromAPI = async (
	address: string | undefined,
	authToken: string | undefined,
	name: string
): Promise<any> => {
	const query = `query unitAPI {
	 unitsFromAPI (search: "${name}") {
			name
			path
			unitId
			responsibleId
			responsibleFirstName
			responsibleLastName
			responsibleEmail
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitsFromAPI,
		errors: result.errors
	};
};

export const fetchRoomsFromAPI = async (
	address: string | undefined,
	authToken: string | undefined,
	name: string
): Promise<any> => {
	const query = `query roomAPI {
	 roomsFromAPI (search: "${name}") {
			name
			id
			building
			floor
			sector
			site
			vol
			facultyuse
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomsFromAPI,
		errors: result.errors
	};
};

export const fetchOrganism = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<any> => {
	const query = `query org {
	bioOrgs {
		organism
		risk_group
		filePath
	}
}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.bioOrgs,
		errors: result.errors
	};
};

export const fetchReportFiles = async (
	address: string | undefined,
	authToken: string | undefined,
	unitId: string[]
): Promise<fetchReportFiles> => {
	const query = `query reportfiles {
	unitReportFiles (id: "[${unitId.map(u => u.replaceAll('\"','\\"')).join(',')}]") {
			id
			name
			path
			unitName
	}
}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitReportFiles,
		errors: result.errors
	};
};

export const fetchDoorPlug = async (
	address: string | undefined,
	authToken: string | undefined,
	roomName: string
): Promise<any> => {
	const query = `query fetchDoorPlug {
	fetchDoorPlug (roomName: "${roomName}") {
			fileUrl
	}
}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data,
		errors: result.errors
	};
};

export const fetchHazardFormChild = async (
	address: string | undefined,
	authToken: string | undefined,
	name: string
): Promise<any> => {
	const query = `query fetchHazardFormChild {
				hazardFormChildren (where: { hazard_form_child_name: {equals: "${name}"}}) {
					id
					form
					version
					hazard_form_child_name
					parentForm {
						hazard_category {
							hazard_category_name
						}
					}
				}
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardFormChildren,
		errors: result.errors
	};
};

export const fetchOrganismsFromFullText = async (
	address: string | undefined,
	authToken: string | undefined,
	search: string,
	take: number,
	skip: number
): Promise<any> => {
	const query: string = `query OrganismFetchFromFullText {
						organismsFromFullText(take: ${take}, skip: ${skip}, search: "${search}") {
							bios {
								id
								organism
								risk_group
								filePath
								updated_on
								updated_by
							}
							totalCount
						}
					}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.organismsFromFullText,
		errors: result.errors
	};
};

export const fetchHazardCategories = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<any> => {
	const query: string = `query categorylist {
							hazardCategories {
								hazard_category_name
							}
						}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardCategories,
		errors: result.errors
	};
};

export const fetchHazards = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string,
	queryString: string
): Promise<fetchHazardsResultsTypeWithPagination> => {
	const query: string = `query HazardFetch { 
				hazardsWithPagination (take: ${take}, skip: ${skip}, search: "${search}", queryString: "${queryString}") {
					hazards {
						lab_display
						hazard_category_name
						parent_submission
						child_submission
						id_lab_has_hazards_child
						id_lab_has_hazards
						global_comment
						modified_by
						modified_on
						tags
					}
					totalCount
				},
			}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardsWithPagination,
		errors: result.errors
	};
};


export const fetchChemicals = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string
): Promise<any> => {
	const query = `query fetchChemicals {
		chemicalsWithPagination (take: ${take}, skip: ${skip}, search: "${search}") {
			chemicals {
				id
				cas_auth_chem
				auth_chem_en
				flag_auth_chem
				fastway
				auth_code
			}
			totalCount
		}
	}`;


	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.chemicalsWithPagination,
		errors: result.errors
	};
};

export const fetchChemicalAuthorizations = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string,
	type: string
): Promise<any> => {
	const query = `query fetchChemicalAuthorizations {
		authorizationsWithPagination (take: ${take}, skip: ${skip}, search: "${search}", type: "${type}") {
			authorizations{
			id
			authorization
			creation_date
			expiration_date
			renewals
			unit {
				name
			}
			authorization_rooms {
				name
				isDeleted
			}
			authorization_holders {
				surname
				name
				sciper
			}
			status
			authorization_chemicals {
				cas_auth_chem
				auth_chem_en
				flag_auth_chem
			}
		}
			totalCount
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.authorizationsWithPagination,
		errors: result.errors
	};
};

export const fetchRadioprotectionAuthorizations = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string,
	type: string
): Promise<any> => {
	const query = `query fetchRadioprotectionAuthorizations {
		authorizationsWithPagination (take: ${take}, skip: ${skip}, search: "${search}", type: "${type}") {
			authorizations{
			id
			authorization
			creation_date
			expiration_date
			renewals
			authority
			unit {
				id
				name
			}
			authorization_rooms {
				name
				isDeleted
			}
			authorization_holders {
				surname
				name
				sciper
			}
			status
			authorization_radiations {
				source
			}
		}
			totalCount
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.authorizationsWithPagination,
		errors: result.errors
	};
};

export const fetchDispensations = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string
): Promise<any> => {
	const query = `query fetchDispensations {
		dispensationsWithPagination (take: ${take}, skip: ${skip}, search: "${search}") {
			dispensations {
				id
				dispensation
				date_start
				date_end
				renewals
				subject
				other_subject
				requires
				comment
				file_path
				created_by
				created_on
				modified_by
				modified_on
				dispensation_rooms {
					name
					isDeleted
				}
				dispensation_units {
					name
				}
				dispensation_holders {
					surname
					name
					sciper
				}
				status
				dispensation_tickets {
					ticket_number
				}
			}
			totalCount
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.dispensationsWithPagination,
		errors: result.errors
	};
};

export const fetchDispensationSubjects = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<any> => {
	const query = `query fetchDispensationSubjects {
		dispensationSubjects {
			subject
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.dispensationSubjects,
		errors: result.errors
	};
};

export const fetchDispensationHistory = async (
	address: string | undefined,
	authToken: string | undefined,
	dispensationId: string
): Promise<any> => {
	const data = [];
	const errors = [];

	const tables = ["dispensation"];
	for (const table of tables) {
		const query = `query fetchDispensationHistory {
		mutationLogsByTable (tableName: "dispensation,dispensation_has_ticket,dispensation_has_room,dispensation_has_holder,dispensation_has_unit", tableIdentifier: ${JSON.stringify(dispensationId)}, 
		excludedField: "modified_on,id_dispensation,modified_by") {
			modified_by
			modified_on
			diffs {
				field
				before
				after
			}
		}
	}`;

		const resultTable = await doGraphQL(query, {}, address, authToken);
		data.push(...resultTable.data?.mutationLogsByTable);
		if (resultTable.errors) {
			errors.push(...resultTable.errors);
		}
	}

	return {
		status: 200,
		data: data,
		errors: errors
	};
};

export const fetchChemicalAuthorizationsByRoom = async (
	address: string | undefined,
	authToken: string | undefined,
	roomId: string,
	type: string
): Promise<any> => {
	const query = `query fetchChemicalAuthorizationsByRoom {
		authorizationsByRoom (roomId: ${JSON.stringify(roomId)}, type: "${type}") {
			id
			authorization
			creation_date
			expiration_date
			renewals
			type
			unit {
				name
			}
			authorization_rooms {
				name
			}
			authorization_holders {
				surname
				name
				sciper
			}
			status
			authorization_chemicals {
				cas_auth_chem
				auth_chem_en
				flag_auth_chem
			}
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.authorizationsByRoom,
		errors: result.errors
	};
};

export const fetchRadioprotectionAuthorizationsByRoom = async (
	address: string | undefined,
	authToken: string | undefined,
	roomId: string,
	type: string
): Promise<any> => {
	const query = `query fetchRadioprotectionAuthorizationsByRoom {
		authorizationsByRoom (roomId: ${JSON.stringify(roomId)}, type: "${type}") {
			id
			authorization
			creation_date
			expiration_date
			renewals
			authority
			unit {
				name
			}
			authorization_rooms {
				name
			}
			authorization_holders {
				surname
				name
				sciper
			}
			status
			authorization_radiations {
				source
			}
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.authorizationsByRoom,
		errors: result.errors
	};
};

export const fetchTags = async (
	address: string | undefined,
	authToken: string | undefined,
	savedTags: string[]
): Promise<any> => {
	const query = `query fetchTags {
		tags (where: {tag_name: {notIn: ${JSON.stringify(savedTags)}}}) {
			tag_name
		}
	}`;

	const result = await doGraphQL(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.tags,
		errors: result.errors
	};
};
