import {env} from "../../utils/env";
import {fetchRooms, fetchRoomsForDropDownComponent} from "../../utils/graphql/FetchingTools";

export const getRoom = async (token: string | undefined): Promise<{ component: string, options: any }> => {
	return {
		component: "Rooms", options: {
			title: 'Rooms',
			key: 'rooms',
			icon: 'terminal',
			schema: {
				label: 'Other impacted rooms',
				type: 'select',
				multiple: true,
				key: 'otherImpactedRooms',
				input: true,
				dataSrc: 'json',
				template: "<span>{{ item.name }}</span>",
				data: {
					json: await fetchRoomList(token)
				}
			},
		}
	};
}

const fetchRoomList = async (
	token: string | undefined
): Promise<string[]> => {
	const results = await fetchRoomsForDropDownComponent(
		env().REACT_APP_GRAPHQL_ENDPOINT_URL,
		token
	);
	if (results.status === 200 && results.data && typeof results.data !== 'string') {
		const r = results.data.map(r => r.name).sort((a,b) => a ? a.localeCompare(b) : 0);
		console.log(r)
		return r;
	} else {
		console.error('Bad GraphQL results', results);
	}
	return [];
}

