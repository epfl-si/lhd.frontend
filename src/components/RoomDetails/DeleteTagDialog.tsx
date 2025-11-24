import * as React from 'react';
import {useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {hazardsAdditionalInfoHasTagType, notificationType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {getErrorMessage} from "../../utils/graphql/Utils";
import {deleteTag} from "../../utils/graphql/PostingTools";

interface DeleteTagDialogProps {
	tag: hazardsAdditionalInfoHasTagType;
	refreshView?: () => void;
	openDialog: boolean;
	setOpenDialog: (open: boolean) => void;
}

export const DeleteTagDialog = ({
	tag,
	refreshView,
	openDialog,
	setOpenDialog
}: DeleteTagDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	function deleteTagFromAdditionalInfo() {
		if (tag) {
			deleteTag(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(tag.id),
			).then(res => {
				handleOpen(res);
			});
		}
	}

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'deleteTag');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else if (res.status === 200) {
			if ( refreshView ) {
				setOpenDialog(false);
				refreshView();
			}
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
			{tag && <AlertDialog openDialog={openDialog}
									 onOkClick={deleteTagFromAdditionalInfo}
									 onCancelClick={() => setOpenDialog(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.deleteButton')}
									 title={t('hazard.deleteTag') + tag.tag.tag_name + "?"}>
			</AlertDialog>}

			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
