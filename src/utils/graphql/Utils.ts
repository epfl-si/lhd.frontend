
export async function makeQuery(
	query: string,
	variables: Object,
	address: string | undefined,
	authToken: string | undefined): Promise<any> {
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
					variables
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
}
