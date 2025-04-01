import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {hazardFormType, notificationType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {saveNewOrganism} from "../../utils/graphql/PostingTools";
import {TextField} from "@material-ui/core";
import {readFileAsBase64} from "../../utils/ressources/file";
import {Numeric} from "epfl-elements-react/src/stories/molecules/inputFields/Numeric.tsx";
import {fetchHazardForms} from "../../utils/graphql/FetchingTools";

interface AddNewOrganismDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
}

export const AddNewOrganismDialog = ({
	openDialog,
	close,
	save
}: AddNewOrganismDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [textInput, setTextInput] = useState<string>("");
	const [risk, setRisk] = useState<number>();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	useEffect(() => {
		setTextInput('');
		setRisk(undefined);
		setSelectedFile(null)
	}, [openDialog]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			setSelectedFile(event.target.files[0]);
		}
	};

	async function onAddOrganism() {
		if ( textInput != '' && risk != undefined ) {
			let fileBase64 = await readFileAsBase64(selectedFile ?? undefined);
			saveNewOrganism(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				textInput,
				risk,
				{
					content: fileBase64 ?? '',
					name: selectedFile?.name
				}
			).then(res => {
				handleOpen(res);
			});
		} else {
			setNotificationType(notificationsVariants['no-organism-chosen']);
			setOpenNotification(true);
		}
	}

	const handleOpen = (res: any) => {
		debugger;
		if ( res.data?.addOrganism?.errors ) {
			const notif: notificationType = {
				text: res.data?.addOrganism?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else {
			setNotificationType(notificationsVariants['save-new-organism-success']);
			save(textInput);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={onAddOrganism}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={t('organism.addNewOrganism')}
									 type='selection'>
				<TextField
					label={t('organism.organismName')}
					fullWidth
					required
					value={textInput}
					onChange={(event) => setTextInput(event.target.value)}
					style={{marginBottom: '10px'}}
				/>
				<Numeric
					id="risk"
					name="risk"
					placeholder={t('organism.risk')}
					val={risk}
					isRequired={true}
					min={0}
					max={3}
					onChange={setRisk}
				/>
				<input
					style={{marginTop: '10px'}}
					type="file"
					accept='.pdf'
					onChange={handleFileChange}
				/>
			</AlertDialog>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
