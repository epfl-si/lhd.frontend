import * as React from 'react';
import {useEffect, useState} from 'react';
import {hazardFormType} from "../../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {FormBuilder} from "@formio/react";
import {Box, TextField, Typography} from "@material-ui/core";
import {fetchHazardFormDetails} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";

/*interface FormDialogProps {
	openDialog: boolean;
	row?: hazardFormType;
	newHazard: boolean;
	onClick?: (e: hazardFormType | undefined) => void;
}*/

export default function FormDialog() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [form, setForm] = useState<hazardFormType>();
	const [newForm, setNewForm] = useState<string>();
	const [category, setCategory] = useState<string>('');

	useEffect(() => {
		const loadFetch = async () => {
			const urlParams = new URLSearchParams(window.location.search);
			setCategory(urlParams.get('cat') ?? '');

			if (urlParams.get('cat') == 'NewCategory') {

			} else {
				const results = await fetchHazardFormDetails(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					urlParams.get('cat') ?? ''
				);
				if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
					setForm(results.data[0]);
					setNewForm(JSON.stringify(results.data[0].form))
				} else {
					console.error('Bad GraphQL results', results);
				}
			}
		}
		loadFetch();
	}, [oidc.accessToken, window.location.search]);

	const handleFormChange = (schema) => {
		console.log('New Form Schema:', schema);
		setNewForm(JSON.stringify(schema))
	};

	/*const handleClose = () => {
		if ( onClick ) {
			onClick(undefined);
			setNewForm(undefined);
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const formJson = Object.fromEntries((formData as any).entries());
		if ( onClick && newForm) {
			onClick({id: JSON.stringify(category == 'NewCategory' || !row ? '{"salt":"newHazard","eph_id":"newHazard"}' : row.id),
				form: newForm,
				version: formJson.version,
				hazard_category: {hazard_category_name: category == 'NewCategory' || !row ? formJson.category : (row.hazard_category.hazard_category_name ?? '')}});
			setNewForm(undefined);
		}
	}*/

	return (
		<Box>
			<Typography variant="h5" gutterBottom>{category == 'NewCategory' ? t(`HazardFormControl.Create`) : t(`HazardFormControl.Modify`)}</Typography>
			<Typography variant="h6" style={{visibility: category == 'NewCategory' ? 'hidden' : 'visible'}}>
				{form?.hazard_category.hazard_category_name}
			</Typography>
			{category == 'NewCategory' && <TextField
				autoFocus
				required={category == 'NewCategory'}
				margin="dense"
				id="category"
				name="category"
				label={t(`HazardFormControl.newHazardCategory`)}
				fullWidth
				variant="standard"
			/>}
			<TextField
				autoFocus
				required
				margin="dense"
				id="version"
				name="version"
				label={category == 'NewCategory' ? t(`HazardFormControl.insertNewVersion`) : `${t(`HazardFormControl.newVersionCurrentIs`)} ${form?.version})`}
				fullWidth
				variant="standard"
			/>
			<FormBuilder
					form={(newForm || form?.form) ? JSON.parse(newForm ?? form!.form) : {}}
					onChange={handleFormChange}
			/>
		</Box>
			/*<Dialog
				fullScreen
				open={openDialog}
				onClose={handleClose}
				PaperProps={{
					component: 'form',
					onSubmit: (event: React.FormEvent<HTMLFormElement>) => handleSubmit(event),
				}}
			>
				<DialogTitle>{newHazard ? t(`HazardFormControl.Create`) : t(`HazardFormControl.Modify`)}</DialogTitle>
				<DialogContent style={{width: '1000'}}>
					<DialogContentText style={{visibility: newHazard ? 'hidden' : 'visible'}}>
						{row?.hazard_category.hazard_category_name}
					</DialogContentText>

					{/!*<div style={{display: "flex", flexDirection: "row"}}>
						<Textarea
							onChange={(event => {
								setNewForm(event.target.value);
							})}
							placeholder="Insert new form"
							maxRows={20}
							sx={{ minWidth: 500 }}
							id="form"
							name="form"
							required
							style={{marginRight: '20px'}}
						/>
						{newForm && <div style={{minWidth: 500}}><Form form={JSON.parse(newForm)}/></div>}
					</div>*!/}
					<FormBuilder
						form={{
							display: 'form',
							components: [
								{
									"label": "Email",
									"tableView": true,
									"key": "email",
									"type": "email",
									"input": true
								},
								{
									"label": "Password",
									"tableView": false,
									"key": "password",
									"type": "password",
									"input": true,
									"protected": true
								},
							]
						}}
						onChange={handleFormChange}
					/>
				</DialogContent>
				<DialogActions>
				<Button onClick={handleClose}>{t(`HazardFormControl.cancel`)}</Button>
					<Button type="submit">{t(`HazardFormControl.save`)}</Button>
				</DialogActions>
			</Dialog>*/
	);
}
