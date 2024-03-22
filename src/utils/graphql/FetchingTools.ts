import {hazardCategory, kindType, lhdUnitsType, roomDetailsType, roomType} from '../ressources/types';
import { formatDataToColumns } from './ParsingTools';
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
					kind {
						name
					}
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
    			}
    			totalCount
				},
			}`;

	console.log(query)
	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.roomsWithPagination,
	};
};

export const fetchUnitsFromFullText = async (
	address: string | undefined,
	authToken: string | undefined,
	take: number,
	skip: number,
	search: string
): Promise<fetchUnitsTypeWithPagination> => {
	const query: string = `query UnitFetchFromFullText { 
						unitsFromFullText(take: ${take}, skip: ${skip}, search: "${search}") {
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
				}
      }`;

	const result = await makeQuery(query, {}, address, authToken);
	return {
		status: result.status,
		data: result.data?.hazardForms
	};
};
