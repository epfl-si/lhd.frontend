import * as React from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchUnitsFromAPI} from "../../utils/graphql/FetchingTools";
import {MultipleSelection} from "../global/MultipleSelection";
import {lhdUnitsFromAPIType, notificationType} from "../../utils/ressources/types";
import {useState} from "react";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {saveNewUnitsFromAPI} from "../../utils/graphql/PostingTools";

interface AddNewUnitDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
}

export const AddNewUnitDialog = ({
	openDialog,
	close,
	save
}: AddNewUnitDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	let selectedUnits: lhdUnitsFromAPIType[] = [];
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	let searchValForNewUnit: string= '';

	const loadFetch = async (name: string) => {
		if (name && name != '') {
			searchValForNewUnit = name;
			const results = await fetchUnitsFromAPI(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				name
			);
			if ( results.status === 200 && results.data ) {
				return results.data;
			} else {
				console.error('Bad GraphQL results', results);
			}
		}
		return [];
	};

	function onSelectUnit(addedUnits: lhdUnitsFromAPIType[]) {
		selectedUnits = addedUnits;
	}

	function getNewUnitTitle(unit: lhdUnitsFromAPIType) {
		return unit.name
	}

	function onAddUnit() {
		if (selectedUnits.length > 0) {
			saveNewUnitsFromAPI(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				selectedUnits,
			).then(res => {
				handleOpen(res);
			});
		} else {
			setNotificationType(notificationsVariants['no-unit-chosen']);
			setOpenNotification(true);
		}
	}

	const handleOpen = (res: any) => {
		if ( res.data?.unitsFromAPI?.errors ) {
			const notif: notificationType = {
				text: res.data?.unitsFromAPI?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else if (res.status === 200) {
			setNotificationType(notificationsVariants['save-new-unit-error']);
			save(searchValForNewUnit);
		} else {
			setNotificationType(notificationsVariants['save-new-unit-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<AlertDialog openDialog={openDialog}
								 onOkClick={onAddUnit}
								 onCancelClick={close}
								 cancelLabel={t('generic.cancelButton')}
								 okLabel={t('generic.saveButton')}
								 title={t('unit.addNewUnit')}>
			<MultipleSelection selected={[]} objectName="NewUnit"
												 onChangeSelection={onSelectUnit}
												 getCardTitle={getNewUnitTitle}
												 fetchData={loadFetch}
			intoModal={true}/>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</AlertDialog>
	);
}
