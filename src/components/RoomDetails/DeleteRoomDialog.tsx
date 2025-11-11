import * as React from 'react';
import {useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {notificationType, roomDetailsType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {deleteRoom} from "../../utils/graphql/PostingTools";
import {getErrorMessage} from "../../utils/graphql/Utils";

interface DeleteRoomDialogProps {
	room?: roomDetailsType;
	openDialog: boolean;
	setOpenDialog: (open: boolean) => void;
	setDeleted: (open: boolean) => void;
}

export const DeleteRoomDialog = ({
	room,
	openDialog,
	setOpenDialog,
	setDeleted,
}: DeleteRoomDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	function deleteRoomDetails() {
		if (room) {
			deleteRoom(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(room.id),
			).then(res => {
				if(res.status == 200 && !res.data?.deleteRoom?.errors) {
					setDeleted(true);
					setOpenDialog(false);
				}
				handleOpen(res);
			});
		}
	}

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'deleteRoom');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else if (res.status === 200) {
			setNotificationType(notificationsVariants['room-update-success']);
		} else {
			setNotificationType(notificationsVariants['room-update-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<>
			{room && <AlertDialog openDialog={openDialog}
									 onOkClick={deleteRoomDetails}
									 onCancelClick={() => setOpenDialog(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.deleteButton')}
									 title={t('room_details.deleteRoomConfirmationMessageTitle') + room.name + "?"}>
				{t('room_details.deleteRoomConfirmationMessageDescription')}
			</AlertDialog>}

			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
