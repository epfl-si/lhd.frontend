
export async function doGraphQL(
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
		errors: graphQLResponse.errors
	};
}

export function getErrorMessage (response: any, method: string) {
	const errorList: string[] = response.errors ? response.errors.map((err) => typeof err === 'string' ? err : err.message) : [];
	const methodErrors = response.data && response.data[method] && response.data[method].errors ?
		response.data[method].errors.map((err: { message: string; }) => err.message) : [];
	errorList.push(...methodErrors);
	if(typeof response.data === 'string' && response.data.indexOf("errors") > -1) {
		errorList.push(...JSON.parse(response.data).errors);
	}
	const errorMessage = errorList.join('\n');

	return {
		notif: {
			text: errorMessage,
			type: 'error'
		},
		errorCount: errorList.length
	};
}
