import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {notificationType, organismType} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {deleteOrganism, deleteUnit, saveNewOrganism, updateOrganism} from "../../utils/graphql/PostingTools";
import {TextField} from "@material-ui/core";
import {handleClickFileLink, readFileAsBase64} from "../../utils/ressources/file";
import {Numeric} from "epfl-elements-react/src/stories/molecules/inputFields/Numeric.tsx";
import {fetchHazards} from "../../utils/graphql/FetchingTools";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {Redirect} from "react-router-dom";

interface AddNewOrganismDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
	selectedOrganism?: organismType;
}

export const AddNewOrganismDialog = ({
																			 openDialog,
																			 close,
																			 save,
																			 selectedOrganism
																		 }: AddNewOrganismDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [textInput, setTextInput] = useState<string>(selectedOrganism ? selectedOrganism.organism : "");
	const [risk, setRisk] = useState<number | undefined>(selectedOrganism ? selectedOrganism.risk_group : undefined);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [loadingDelete, setLoadingDelete] = useState(false);
	const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);
	const [deleted, setDeleted] = useState(false);

	useEffect(() => {
		setTextInput(selectedOrganism ? selectedOrganism.organism : '');
		setRisk(selectedOrganism ? selectedOrganism.risk_group : undefined);
		setSelectedFile(null)
	}, [openDialog, selectedOrganism]);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			setSelectedFile(event.target.files[0]);
		}
	};

	async function onAddOrganism() {
		if ( textInput != '' && risk != undefined ) {
			let fileBase64 = await readFileAsBase64(selectedFile ?? undefined);
			const date = new Date();
			const fileName = fileBase64 ? date.toISOString().split("T")[0] + "_" + textInput.replaceAll(" ", "_").replaceAll("/", "_") + ".pdf" : '';
			if (selectedOrganism) {
				updateOrganism(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					JSON.stringify(selectedOrganism.id),
					textInput,
					risk,
					{
						content: fileBase64 ?? '',
						name: fileName
					}
				).then(res => {
					handleOpen(res);
				});
			} else {
				saveNewOrganism(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					textInput,
					risk,
					{
						content: fileBase64 ?? '',
						name: fileName
					}
				).then(res => {
					handleOpen(res);
				});
			}
		} else {
			setNotificationType(notificationsVariants['no-organism-chosen']);
			setOpenNotification(true);
		}
	}

	const handleOpen = (res: any, saveNew: boolean) => {
		if (saveNew ? res.data?.addOrganism?.errors : res.data?.updateOrganism?.errors ) {
			const notif: notificationType = {
				text: saveNew ? res.data?.addOrganism?.errors[0].message : res.data?.updateOrganism?.errors[0].message,
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

	const handleDelete = async () => {
		setLoadingDelete(true);
		const results = await fetchHazards(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			20,
			0,
			'Biological',
			'organism=' + selectedOrganism?.organism
		);

		if ( results.status && results.status === 200 && results.data && results.data.totalCount > 0) {
			setOpenDialogDelete(true);
		} else {
			deleteOrg();
		}
		setLoadingDelete(false);
	};

	function deleteOrg() {
		deleteOrganism(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			JSON.stringify(selectedOrganism?.id),
		).then(res => {
			if(res.status == 200 && !res.data?.deleteOrganism?.errors) {
				setOpenDialogDelete(false);
				close();
				setDeleted(true);
			}
		});
	}

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={onAddOrganism}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={selectedOrganism ? t('organism.modifyOrganism') : t('organism.addNewOrganism')}
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
				{selectedOrganism && selectedOrganism.filePath &&
			<div><a href={selectedOrganism.filePath}
					onClick={e => handleClickFileLink(e, oidc.accessToken, selectedOrganism.filePath)}>
							{selectedOrganism.filePath.split('/').pop()}
			</a></div>
				}
				<input
					style={{marginTop: '10px'}}
					type="file"
					accept='.pdf'
					onChange={handleFileChange}
				/>
				{selectedOrganism && <div style={{marginTop: '20px', paddingLeft: '0px'}}><Button
			onClick={handleDelete}
			label={t(`generic.deleteButton`)}
			iconName={`${featherIcons}#trash`}
			primary/></div>
				}
			</AlertDialog>
			<AlertDialog openDialog={openDialogDelete}
									 onCancelClick={() => setOpenDialogDelete(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.deleteButton')}
									 title={t('organism.deleteOrganismTitle')}>
				{t('organism.deleteOrganismMessageStart')}
				<a href={'/hazardscontrol?Category=Biological&organism='+selectedOrganism?.organism} target="_blank">{t('organism.link')}</a>
				{t('organism.deleteOrganismMessageEnd')}
			</AlertDialog>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
			{deleted && <Redirect to="/organismscontrol"/>}
		</>
	);
}
