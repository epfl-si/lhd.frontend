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
import {makeQuery} from "./Utils";

type fetchResultsType = {
	status?: number;
	data?: Object[] | string;
};

type fetchRoomResultsType = {
	status?: number;
	data?: roomDetailsType[] | string;
};

type fetchRoomResultsTypeWithPagination = {
	status?: number;
	data?: roomsWithPaginationType;
};

type fetchHazardsResultsTypeWithPagination = {
	status?: number;
	data?: hazardsWithPaginationType;
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
};

type fetchUnitsType = {
	status?: number;
	data?: lhdUnitsType[] | string;
};

type fetchUnitsTypeWithPagination = {
	status?: number;
	data?: unitsWithPaginationType;
};

type fetchOrganismsTypeWithPagination = {
	status?: number;
	data?: organismType[];
};

type fetchReportFiles = {
	status?: number;
	data?: reportFile[];
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
				rooms (where: { name: { equals: "${room}"} }) {
				id
					name
					building
					sector
					floor
					vol
					vent
					adminuse
					facultyuse
					lab_type_is_different
					site
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
            comment
            filePath
            modified_by
            modified_on
            hazard_category {
              hazard_category_name
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

	const result = await makeQuery(query, variables, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
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

	const result = await makeQuery(query, variables, address, authToken);
	return {
		status: result.status,
		data: result.data?.units,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomKinds,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.units,
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
						vent
						site
						kind {
							name
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
							}
							professors {
								name
								surname
							}
						}
    			}
    			totalCount
				},
			}`;

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomsWithPagination,
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
						vent
						site
						kind {
							name
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
							}
							professors {
								name
								surname
							}
						}
    			}
    			totalCount
				},
			}`;

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomsWithPagination,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.rooms,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitsFromFullTextAndPagination,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitsFromFullText,
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

	const result = await makeQuery(query, variables, address, authToken);
	return {
		status: result.status,
		data: result.data?.dispensations,
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
	const result = await makeQuery(query, variables, address, authToken);
	return result;
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

	const result = await makeQuery(query, variables, address, authToken);
	const version = result.data?.dispensations[0]?.versions;

	return {
		status: result.status,
		data: version[version.length-1],
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.personFullText
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardForms
	};
};

export const fetchHazardFormDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	categoryName: string
): Promise<any> => {
	const query = `query fetchHazardFormDetails {
        hazardForms (where: { hazard_category: {hazard_category_name:  { contains: "${categoryName}" }}}) {
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardForms
	};
};

export const fetchConnectedUser = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<any> => {
	const query = `query connection {
            connectedUserInfo {
              groups
             	preferred_username
             	given_name
             	family_name
            }
          }`;

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.connectedUserInfo
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitsFromAPI
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomsFromAPI
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.bioOrgs
	};
};

export const fetchReportFiles = async (
	address: string | undefined,
	authToken: string | undefined,
	unitId: string[]
): Promise<fetchReportFiles> => {
	const query = `query reportfiles {
  unitReportFiles (id: "[${unitId.map(u => u.replaceAll('\"','\\"')).join(',')}]") {
			name
			path
			unitName
  }
}`;

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.unitReportFiles
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardFormChildren
	};
};

export const fetchOrganismsFromFullText = async (
	address: string | undefined,
	authToken: string | undefined,
	search: string
): Promise<fetchOrganismsTypeWithPagination> => {
	const query: string = `query OrganismFetchFromFullText {
						organismsFromFullText(search: "${search}") {
							id
							organism
							risk_group
							filePath
							updated_on
							updated_by
						}
					}`;

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.organismsFromFullText,
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

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardCategories,
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
					}
					totalCount
				},
			}`;

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardsWithPagination,
	};
};
