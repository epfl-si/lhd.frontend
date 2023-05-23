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
						'accept-language': 'en-US,en;q=0.9,fr-CH;q=0.8,fr;q=0.7',
						'content-type': 'application/json',
						'sec-ch-ua':
							'" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"',
						'sec-ch-ua-mobile': '?0',
						'sec-ch-ua-platform': '"macOS"',
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
						}", date_end: "${dispensation.endDate}") {
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
