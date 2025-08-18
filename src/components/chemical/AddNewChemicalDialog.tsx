import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {chemicalsType, notificationType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {MenuItem, Select, TextField} from "@material-ui/core";
import {saveNewChemical, updateChemical} from "../../utils/graphql/PostingTools";
import {SelectChangeEvent} from "@mui/material";

interface AddNewChemicalDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
	selectedChemical?: chemicalsType;
}

export const AddNewChemicalDialog = ({
																			 openDialog,
																			 close,
																			 save,
																			 selectedChemical
																		 }: AddNewChemicalDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [cas, setCAS] = useState<string>(selectedChemical ? selectedChemical.cas_auth_chem : "");
	const [name, setName] = useState<string>(selectedChemical ? selectedChemical.auth_chem_en : "");
	const [status, setStatus] = useState<string>(selectedChemical ? (selectedChemical.flag_auth_chem ? 'Active' : 'Archived') : '');

	useEffect(() => {
		setCAS(selectedChemical ? selectedChemical.cas_auth_chem : '');
		setName(selectedChemical ? selectedChemical.auth_chem_en : '');
		setStatus(selectedChemical ? (selectedChemical.flag_auth_chem ? 'Active' : 'Archived') : '');
	}, [openDialog, selectedChemical]);

	async function onAddChemical() {
		if ( cas != '' && name != '') {
			if (selectedChemical) {
				updateChemical(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					JSON.stringify(selectedChemical.id),
					cas,
					name,
					status === 'Active'
				).then(res => {
					handleOpen(res, false);
				});
			} else {
				saveNewChemical(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					cas,
					name,
					status === 'Active'
				).then(res => {
					handleOpen(res, true);
				});
			}
		} else {
			setNotificationType(notificationsVariants['no-chemical-chosen']);
			setOpenNotification(true);
		}
	}

	const handleOpen = (res: any, saveNew: boolean) => {
		if (saveNew ? res.data?.addChemical?.errors : res.data?.updateChemical?.errors ) {
			const notif: notificationType = {
				text: saveNew ? res.data?.addChemical?.errors[0].message : res.data?.updateChemical?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else {
			setNotificationType(notificationsVariants['save-new-chemical-success']);
			save(cas);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={onAddChemical}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={selectedChemical ? t('chemical.modifyChemical') : t('chemical.addChemical')}
									 type='selection'>
				<TextField
					label={t('chemical.CASNumber')}
					fullWidth
					required
					value={cas}
					onChange={(event) => setCAS(event.target.value)}
					style={{marginBottom: '10px'}}
				/>
				<TextField
					label={t('chemical.name')}
					fullWidth
					required
					value={name}
					onChange={(event) => setName(event.target.value)}
					style={{marginBottom: '10px'}}
				/>
				<Select
					value={status}
					onChange={(event: SelectChangeEvent) => {
						setStatus(event.target.value)
					}}
					label={t("chemical.status")}
				>
					<MenuItem value={t("chemical.active")}>{t("chemical.active")}</MenuItem>
					<MenuItem value={t("chemical.archived")}>{t("chemical.archived")}</MenuItem>
				</Select>
			</AlertDialog>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
