import * as React from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";

interface ConfirmSavingRadioprotectionDialogProps {
	openDialog: boolean;
	setOpenDialog: (open: boolean) => void;
	onAddDispensation: () => void;
}

export const ConfirmSavingDispensationDialog = ({
	openDialog,
	setOpenDialog,
	onAddDispensation
}: ConfirmSavingRadioprotectionDialogProps) => {
	const { t } = useTranslation();

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={onAddDispensation}
									 onCancelClick={() => setOpenDialog(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={t('dispensation.confirmationMessageTitle')}>
				{t('dispensation.confirmationMessageBody')}
			</AlertDialog>
		</>
	);
}
