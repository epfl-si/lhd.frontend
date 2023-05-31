import { dispensationRequestType } from '../ressources/types';

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
							dispensation.requirements
						}", comment: "${dispensation.comment}", date_start: "${
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
              editDraftDispensation(slug: "${slug}", subject: "${dispensation.subject}", description: "${dispensation.requirements}", comment: "${dispensation.comment}", date_start: "${dispensation.startDate}", date_end: "${dispensation.endDate}", rooms: ${dispensation.rooms}, holders: ${dispensation.holders}) {
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
