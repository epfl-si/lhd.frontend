
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
		status: graphQLResponse.errors && graphQLResponse.errors.length > 0 ? 500 : results.status,
		data: graphQLResponse.data,
		errors: graphQLResponse.errors
	};
}

export function getErrorMessage (response: any, method: string) {
	const errorList: string[] = response.errors ? response.errors.map((err: { message: string; }) => err.message) : [];
	const methodErrors = response.data && response.data[method] && response.data[method].errors ?
		response.data[method].errors.map((err: { message: string; }) => err.message) : [];
	errorList.push(...methodErrors);

	const errorMessage = errorList.join('\n');

	const errorsMap = [
		{
			key: "Unique constraint failed",
			message: 'An element with this name appears to already exist'
		},
		{
			key: "Foreign key constraint failed",
			message: 'Relationship not updated'
		},
	]

	const parsedMessage = errorsMap.find(err => errorMessage.indexOf(err.key) > -1);

	return {
		notif: {
			text: parsedMessage ? parsedMessage.message : errorMessage,
			type: 'error'
		},
		errorCount: errorList.length
	};
}
