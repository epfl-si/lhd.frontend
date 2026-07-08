import {notificationType, personType, roomDetailsType} from "../ressources/types";
import {fetchPeopleFromFullText, fetchRooms, fetchUnitsByRoom} from "./FetchingTools";
import {env} from "../env";
import {getErrorMessage} from "./Utils";

export const commonFetchRoomList = async (token: string | undefined,
																					room: string,
																					setNotificationType: (value: (((prevState: notificationType) => notificationType) | notificationType)) => void,
																					setOpenNotification: (b: boolean) => void): Promise<roomDetailsType[]> => {
	const results = await fetchRooms(
		env().REACT_APP_GRAPHQL_ENDPOINT_URL,
		token,
		100,0, "Room=" + room
	);
	if (results.status === 200) {
		if (results.data) {
			return results.data.rooms;
		} else {
			const errors = getErrorMessage(results, 'roomsWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
	}
	return [];
};

export const commonFetchUnitsListByRooms = async (token: string | undefined,
																									selectedRooms: roomDetailsType[],
																									setNotificationType: (value: (((prevState: notificationType) => notificationType) | notificationType)) => void,
																									setOpenNotification: (b: boolean) => void) => {
	if (selectedRooms.length > 0) {
		const rooms = selectedRooms.filter(room => room.status !== 'Deleted').map(room => room.name);
		const results = await fetchUnitsByRoom(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			token,
			rooms
		);
		if (results.status === 200) {
			if (results.data) {
				return (results.data);
			} else {
				const errors = getErrorMessage(results, 'unitsByRoom');
				setNotificationType(errors.notif);
				setOpenNotification(true);
			}
		}
	}
	return ([]);
};

export const commonFetchPeople = async (token: string | undefined,
																	name: string,
																	setNotificationType: (value: (((prevState: notificationType) => notificationType) | notificationType)) => void,
																	setOpenNotification: (b: boolean) => void): Promise<personType[]> => {
	const results = await fetchPeopleFromFullText(
		env().REACT_APP_GRAPHQL_ENDPOINT_URL,
		token,
		name
	);
	if (results.status === 200) {
		if (results.data) {
			return results.data;
		} else {
			const errors = getErrorMessage(results, 'personFullText');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
	}
	return [];
};
