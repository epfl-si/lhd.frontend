import * as React from 'react';
import {useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {authorizationType, notificationType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {deleteAuthorization} from "../../utils/graphql/PostingTools";
import {getErrorMessage} from "../../utils/graphql/Utils";

interface DeleteRadioprotectionDialogProps {
	auth?: authorizationType;
	openDialog: boolean;
	setOpenDialog: (open: boolean) => void;
	setDeleted: (open: boolean) => void;
}

export const DeleteRadioprotectionDialog = ({
	auth,
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
		if (auth) {
			deleteAuthorization(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(auth.id)
			).then(res => {
				if(res.status == 200 && !res.data?.deleteAuth?.errors) {
					setDeleted(true);
					setOpenDialog(false);
				}
				handleOpen(res);
			});
		}
	}

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'deleteAuthorization');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else if (res.status === 200) {
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
			{auth && <AlertDialog openDialog={openDialog}
									 onOkClick={deleteDetails}
									 onCancelClick={() => setOpenDialog(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.deleteButton')}
									 title={t('authorization.deleteAuthConfirmationMessageTitle') + auth.authorization + "?"}>
				{t('authorization.deleteAuthConfirmationMessageDescription')}
			</AlertDialog>}

			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
