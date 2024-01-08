import {dispensationRequestType, roomDetailsForSaveType, roomDetailsType} from '../ressources/types';

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
	room: roomDetailsForSaveType,
	variables: Object
): Promise<any> => {
	const operationName = 'updateRoom';
	const query = `mutation ${operationName} {
               updateRoom(
               name: "${room.name}",
               kind: "${room.kind}",
							 vol: ${room.vol},
							 vent: "${room.vent}",
							 units: [${room.lhd_units}] ) {
                errors {
                  message
                }
                isSuccess
              }
            }`;

	console.log(query);
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
					query,
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
