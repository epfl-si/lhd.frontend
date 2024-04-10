import * as React from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {DebounceInput} from "epfl-elements-react/src/stories/molecules/inputFields/DebounceInput.tsx";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchUnitsFromAPI} from "../../utils/graphql/FetchingTools";
import {DataGrid} from "@mui/x-data-grid";
import {lhdUnitsType} from "../../utils/ressources/types";

interface AddNewUnitDialogProps {
	openDialog: boolean;
	close: () => void;
}

export const AddNewUnitDialog = ({
	openDialog,
	close
}: AddNewUnitDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();

	const loadFetch = async (name: string) => {
		if (name && name != '') {
			const results = await fetchUnitsFromAPI(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				name
			);
			if ( results.status === 200 && results.data ) {
				//TODO  save result list in state https://codesandbox.io/p/sandbox/66424752get-row-item-on-checkbox-selection-in-react-material-ui-data-grid-wp4vl?file=%2Fdemo.tsx%3A10%2C6-11%2C62
			} else {
				console.error('Bad GraphQL results', results);
			}
		}
	};

	function onAddUnit() {
		//TODO  add control for not empty array
		//TODO save selected units
		close();
	}

	return (
		<AlertDialog openDialog={openDialog}
								 onOkClick={onAddUnit}
								 onCancelClick={close}
								 cancelLabel={t('generic.cancelButton')}
								 okLabel={t('generic.continueButton')}
								 title={t('hazard_details.unsavedChangesMessageTitle')}>
			<DebounceInput
				input={''}
				id="member"
				onChange={loadFetch}
				placeholder={t(`unit.search`)}
				className="debounce-input"
			/>

		</AlertDialog>
	);
}
