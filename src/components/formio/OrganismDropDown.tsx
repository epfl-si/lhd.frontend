import {env} from "../../utils/env";
import {fetchOrganism} from "../../utils/graphql/FetchingTools";

export const getOrganism = async (token: string | undefined): Promise<{ component: string, options: any }> => {
	return {
		component: "Organism", options: {
			title: 'Organism',
			key: 'organism',
			icon: 'terminal',
			schema: {
				label: 'Organism',
				type: 'select',
				key: 'organism',
				input: true,
				dataSrc: 'json',
				template: "<span>{{ item.organism }}</span>",
				data: {
					json: await fetchOrganismList(token)
				}
			},
		}
	};
}

const fetchOrganismList = async (
	token: string | undefined
): Promise<object[]> => {
	const results = await fetchOrganism(
		env().REACT_APP_GRAPHQL_ENDPOINT_URL,
		token
	);
	if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
		return results.data;
	} else {
		console.error('Bad GraphQL results', results);
	}
	return [];
}
