import {kindType, lhdUnitsType, roomDetailsType, roomType} from '../ressources/types';
import { formatDataToColumns } from './ParsingTools';

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
	const operationName = 'SingleRoomFetch';
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
						query: `query ${operationName} { 
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
			}`,
						variables,
					}),
					method: 'POST',
					mode: 'cors',
					credentials: 'omit',
			  })
			: null;

			/*dispensations {
						slug
						versions {
							subject
							date_end
							status
							holders {
								name
							}
						}
					}*/

	if (results?.status !== 200) {
		return { status: results?.status, data: await results?.text() };
	}

	const graphQLResponse = await results.json();

	return {
		status: results.status,
		data: graphQLResponse.data?.rooms,
	};
};

export const fetchUnitDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	unit: string | null,
	variables: Object
): Promise<fetchUnitsType> => {
	const operationName = 'SingleUnitFetch';
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
					query: `query ${operationName} { 
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
								}
								professors {
									name
									surname
									sciper
								}
						},
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
		data: graphQLResponse.data?.units,
	};
};


export const fetchRoomTypes = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<fetchKindRoomType> => {
	const operationName = 'KindRoomFetch';
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
					query: `query ${operationName} { 
						roomKinds {
							name
						}
					}`
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
		data: graphQLResponse.data?.roomKinds,
	};
};


export const fetchUnits = async (
	address: string | undefined,
	authToken: string | undefined
): Promise<fetchUnitsType> => {
	const operationName = 'UnitFetch';
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
					query: `query ${operationName} { 
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
					}`
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
		data: graphQLResponse.data?.units,
	};
};

export const fetchSlugs = async (
	address: string | undefined,
	authToken: string | undefined,
	variables: Object
): Promise<any> => {
	const operationName = 'getSlugs';
	const results =
		typeof address === 'string'
			? await fetch(address, {
					headers: {
						accept: '*/*',
						'content-type': 'application/json',
						'sec-ch-ua-mobile': '?0',
						'sec-fetch-dest': 'empty',
						'sec-fetch-mode': 'cors',
						'sec-fetch-site': 'cross-site',
						authorization: `Bearer ${authToken}`,
					},
					referrerPolicy: 'no-referrer-when-downgrade',
					body: JSON.stringify({
						query: `query ${operationName} {
							dispensations {
								slug
							}
						}
						`,
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
		data: graphQLResponse.data?.dispensations,
	};
};

export const fetchDispFormDetails = async (
	address: string | undefined,
	authToken: string | undefined,
	variables: Object
): Promise<any> => {
	const operationName = 'getDispensationFormDetails';
	const results =
		typeof address === 'string'
			? await fetch(address, {
					headers: {
						accept: '*/*',
						'content-type': 'application/json',
						'sec-ch-ua-mobile': '?0',
						'sec-fetch-dest': 'empty',
						'sec-fetch-mode': 'cors',
						'sec-fetch-site': 'cross-site',
						authorization: `Bearer ${authToken}`,
					},
					referrerPolicy: 'no-referrer-when-downgrade',
					body: JSON.stringify({
						query: `query ${operationName} {
							rooms {
								name
							}
							people {
								name
								sciper
							}
						}
						`,
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

export const fetchSingleDispensation = async (
	address: string | undefined,
	authToken: string | undefined,
	slug: string | null,
	variables: Object
): Promise<any> => {
	const operationName = 'SingleDispensationFetch';
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
						query: `query ${operationName} { 
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
	const version = graphQLResponse.data?.dispensations[0]?.versions;

	return {
		status: results.status,
		data: version[version.length-1],
	};
};
