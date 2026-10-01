import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchProfileRoles} from "../../utils/graphql/FetchingTools";
import {Checkbox, FormControl, FormControlLabel, FormLabel, TextField} from '@material-ui/core';
import {FormGroup} from "@mui/material";
import {AlertDialog} from "../global/AlertDialog";
import {formatDateForPickers} from "../../utils/ressources/parser";

interface AddNewProfileDialogProps {
	openDialog: boolean;
	setSelectedRoles: (event: React.ChangeEvent<HTMLInputElement>) => void;
	setExpirationDate: (date: Date) => void;
	expirationDate?: Date;
	save: () => void;
	close: () => void;
}

export const AddNewProfileDialog = ({
	openDialog,
	setSelectedRoles,
	setExpirationDate,
	expirationDate,
	save,
	close
}: AddNewProfileDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [roles, setRoles] = useState<string[]>();

	useEffect(() => {
		fetchRoles();
	}, [openDialog]);

	const fetchRoles = async () => {
		const results = await fetchProfileRoles(
			env().REACT_APP_BACKEND_ENDPOINT_URL,
			oidc.accessToken
		);

		if (results.status === 200 && results.data) {
			setRoles(results.data);
		}
	}

	return (
		<AlertDialog openDialog={openDialog}
								 onOkClick={save}
								 isOkDisabled={!expirationDate}
								 onCancelClick={close}
								 cancelLabel={t('generic.cancelButton')}
								 okLabel={t('generic.addButton')}
								 type='selection' width={"sm"}>

			<FormControl component="fieldset">
				<FormLabel component="legend">{t('roles.title')}</FormLabel>
				<FormGroup>
					{roles?.map(role => {
						return <FormControlLabel control={<Checkbox
							onChange={setSelectedRoles} value={role}/>} label={role}/>
					})}
				</FormGroup>
			</FormControl>

			<TextField
				label={t('roles.expirationDate')}
				type="date"
				required={true}
				value={formatDateForPickers(expirationDate)}
				onChange={(e) => setExpirationDate(new Date(e.target.value))}
				InputLabelProps={{ shrink: true }}
				fullWidth
			/>

		</AlertDialog>
	);
}
