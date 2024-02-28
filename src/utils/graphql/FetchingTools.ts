import {kindType, lhdUnitsType, roomDetailsType, roomType} from '../ressources/types';
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

type fetchKindRoomType = {
	status?: number;
	data?: kindType[] | string;
};

type fetchUnitsType = {
	status?: number;
	data?: lhdUnitsType[] | string;
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
					name
					building
					sector
					floor
					vol
					vent
					kind {
						name
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

export const fetchUnitDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	unit: string | null,
	variables: Object
): Promise<fetchUnitsType> => {
	const query: string = `query SingleUnitFetch { 
						units (where: {name: { equals: "${unit}"} }) {
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

export const fetchUnitsFromFullText = async (
	address: string | undefined,
	authToken: string | undefined,
	search: string
): Promise<fetchUnitsType> => {
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
