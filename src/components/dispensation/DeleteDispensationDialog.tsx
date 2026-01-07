import * as React from 'react';
import {useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {dispensationType, notificationType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {deleteDispensation} from "../../utils/graphql/PostingTools";
import {getErrorMessage} from "../../utils/graphql/Utils";

interface DeleteRadioprotectionDialogProps {
	disp?: dispensationType;
	openDialog: boolean;
	setOpenDialog: (open: boolean) => void;
	setDeleted: (open: boolean) => void;
}

export const DeleteDispensationDialog = ({
	disp,
	openDialog,
	setOpenDialog,
	setDeleted,
}: DeleteRadioprotectionDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	function deleteDetails() {
		if (disp) {
			deleteDispensation(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(disp.id)
			).then(res => {
				handleOpen(res);
			});
		}
	}

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'deleteDispensation');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else if (res.status === 200) {
			setDeleted(true);
			setOpenDialog(false);
			setNotificationType(notificationsVariants['update_success']);
		} else {
			setNotificationType(notificationsVariants['update_error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<>
			{disp && disp.status === 'Draft' && <AlertDialog openDialog={openDialog}
									 onOkClick={deleteDetails}
									 onCancelClick={() => setOpenDialog(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.deleteButton')}
									 title={t('dispensation.deleteDispConfirmationMessageTitle') + disp.dispensation + "?"}>
				{t('dispensation.deleteDispConfirmationMessageDescription')}
			</AlertDialog>}

			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
