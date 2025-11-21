import * as React from 'react';
import {useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {lhdUnitsType, notificationType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {deleteUnit} from "../../utils/graphql/PostingTools";
import {getErrorMessage} from "../../utils/graphql/Utils";

interface DeleteUnitDialogProps {
	unit?: lhdUnitsType;
	openDialog: boolean;
	setOpenDialog: (open: boolean) => void;
	setDeleted: (open: boolean) => void;
}

export const DeleteUnitDialog = ({
	unit,
	openDialog,
	setOpenDialog,
	setDeleted,
}: DeleteUnitDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	function deleteUnitDetails() {
		if (unit) {
			deleteUnit(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(unit.id),
			).then(res => {
				handleOpen(res);
			});
		}
	}

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'deleteUnit');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else if (res.status === 200) {
			setDeleted(true);
			setOpenDialog(false);
			setNotificationType(notificationsVariants['unit-delete-success']);
		} else {
			setNotificationType(notificationsVariants['unit-update-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<>
			{unit && <AlertDialog openDialog={openDialog}
									 onOkClick={deleteUnitDetails}
									 onCancelClick={() => setOpenDialog(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.deleteButton')}
									 title={t('unit_details.deleteUnitConfirmationMessageTitle') + unit.name + "?"}>
				{t('unit_details.deleteUnitConfirmationMessageDescription')}
			</AlertDialog>}

			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
