import * as React from 'react';
import {useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {assessmentType, notificationType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {deleteAssessment} from "../../utils/graphql/PostingTools";
import {getErrorMessage} from "../../utils/graphql/Utils";

interface DeleteRadioprotectionDialogProps {
	assessment?: assessmentType;
	openDialog: boolean;
	setOpenDialog: (open: boolean) => void;
	setDeleted: (open: boolean) => void;
}

export const DeleteAssessmentDialog = ({
																				 assessment,
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
		if (assessment) {
			deleteAssessment(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(assessment.id)
			).then(res => {
				handleOpen(res);
			});
		}
	}

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'deleteAssessmentDecision');
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
			{assessment && assessment.status === 'Draft' && <AlertDialog openDialog={openDialog}
									 onOkClick={deleteDetails}
									 onCancelClick={() => setOpenDialog(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.deleteButton')}
									 title={t('assessment.deleteAssConfirmationMessageTitle') + assessment.assessment + "?"}>
				{t('assessment.deleteAssConfirmationMessageDescription')}
			</AlertDialog>}

			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
