import * as React from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchRoomsFromAPI} from "../../utils/graphql/FetchingTools";
import {MultipleSelection} from "../global/MultipleSelection";
import {notificationType, roomDetailsType} from "../../utils/ressources/types";
import {useState} from "react";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {saveNewRoomsFromAPI, saveNewUnitsFromAPI} from "../../utils/graphql/PostingTools";

interface AddNewRoomDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
}

export const AddNewRoomDialog = ({
	openDialog,
	close,
	save
}: AddNewRoomDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	let selectedRooms: roomDetailsType[] = [];
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	let searchValForNewRoom: string= '';

	const loadFetch = async (name: string) => {
		if (name && name != '') {
			searchValForNewRoom = name;
			const results = await fetchRoomsFromAPI(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				name
			);
			if ( results.status === 200 && results.data ) {
				return results.data;
			} else {
				console.error('Bad GraphQL results', results);
			}
		}
		return [];
	};

	function onSelectRoom(addedRooms: roomDetailsType[]) {
		selectedRooms = addedRooms;
	}

	function getNewRoomTitle(room: roomDetailsType) {
		return room.name
	}

	function onAddRoom() {
		console.log(selectedRooms);
		saveNewRoomsFromAPI(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			selectedRooms,
		).then(res => {
			handleOpen(res);
		});
	}

	const handleOpen = (res: any) => {
		if ( res.data?.RoomsFromAPI?.errors ) {
			const notif: notificationType = {
				text: res.data?.RoomsFromAPI?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else if (res.status === 200) {
			setNotificationType(notificationsVariants['room-update-success']);
			save(searchValForNewRoom);
		} else {
			setNotificationType(notificationsVariants['room-update-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<AlertDialog openDialog={openDialog}
								 onOkClick={onAddRoom}
								 onCancelClick={close}
								 cancelLabel={t('generic.cancelButton')}
								 okLabel={t('generic.saveButton')}
								 title={t('room.addNewRoom')}>
			<MultipleSelection selected={[]} objectName="NewRoom"
												 onChangeSelection={onSelectRoom}
												 getCardTitle={getNewRoomTitle}
												 fetchData={loadFetch}/>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</AlertDialog>
	);
}
