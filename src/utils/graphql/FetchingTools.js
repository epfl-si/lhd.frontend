import { formatDataToColumns } from './ParsingTools';

export const fetchResults = async (address, authToken, graphqlBody, variables) => {
	const operationName = 'AppTableFetch';
	const results = await fetch(address, {
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
			query: `query ${operationName} { ${graphqlBody} }`,
			variables,
		}),
		method: 'POST',
		mode: 'cors',
		credentials: 'omit',
	});
	const graphQLResponse = await results.json();

	return graphQLResponse.data?.rooms.map((room, index) =>
		formatDataToColumns(graphqlBody, room, index)
	);
};
