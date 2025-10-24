import * as React from 'react';
import {useEffect, useState} from 'react';
import {hazardFormType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {Box, TextField, Typography} from "@material-ui/core";
import {fetchConnectedUser, fetchHazardFormDetails} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {Button} from "epfl-elements-react-si-extra";
import {createNewHazardCategory, updateFormHazard} from "../utils/graphql/PostingTools";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {useHistory} from "react-router-dom";
import {HazardFormChildList} from "../components/HazardsForm/hazardFormChildList";
import {compareVersions, findAllKeysForSubmission} from "../utils/ressources/jsonUtils";
import {LHDv3FormBuilder} from "../components/formio/LHDv3Forms";

export default function HazardFormDetails() {
	const history = useHistory();
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [hazardFormDetails, setHazardFormDetails] = useState<hazardFormType>();
	const [newForm, setNewForm] = useState<string>();
	const [category, setCategory] = useState<string>('');
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const urlParams = new URLSearchParams(window.location.search);
	const [originalForm, setOriginalForm] = useState<string>();
	const [user, setUser] = useState<any>({isAdmin: false});

	useEffect(() => {
		loadFetchUser();
	}, [oidc.accessToken, window.location.search]);

	const loadFetchUser = async () => {
		const results = await fetchConnectedUser(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);
		if (results.status === 200 && results.data) {
			setUser(results.data);
			if (results.data.isAdmin) {
				setCategory(urlParams.get('cat') ?? '');
				if (urlParams.get('cat') != 'NewCategory') {
					loadFetch(urlParams.get('cat') ?? '');
				}
			}
		}
	};

	const loadFetch = async (cat: string) => {
		const results = await fetchHazardFormDetails(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			cat
		);
		if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
			setHazardFormDetails(results.data[0]);
			setNewForm(JSON.stringify(results.data[0].form));
			setOriginalForm(results.data[0].form);
			setCategory(results.data[0].hazard_category.hazard_category_name);
		} else {
			console.error('Bad GraphQL results', results);
		}
	}

	const handleSubmit = () => {
		if (category != '' && newForm && newForm != '') {
			if (urlParams.get('cat') == 'NewCategory') {
				createNewHazardCategory (
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					{
						id: JSON.stringify('{"salt":"newHazard","eph_id":"newHazard"}'),
						form: JSON.stringify(newForm),
						version: '1.0.0',
						hazard_category: {hazard_category_name: category}
					}
				).then(res => {
					handleOpen(res);
				});
			} else {
				const originalFormKeys = findAllKeysForSubmission(JSON.parse(originalForm ?? ''));
				const newFormKeys = findAllKeysForSubmission(JSON.parse(newForm));
				const newVersion = compareVersions(originalFormKeys, newFormKeys, hazardFormDetails?.version);
				updateFormHazard (
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					{
						id: JSON.stringify(hazardFormDetails?.id),
						form: JSON.stringify(newForm),
						version: newVersion,
						hazard_category: {hazard_category_name: category}
					}
				).then(res => {
					handleOpen(res);
				});
			}
		} else {
			const notif: notificationType = {
				text: t(`hazardFormControl.fillMandatoryFields`),
				type: 'error'
			};
			setNotificationType(notif);
			setOpenNotification(true);
		}
	}

	const handleOpen = async (res: any) => {
		if ( res.data?.updateForm?.errors ) {
			const notif: notificationType = {
				text: res.data?.updateForm?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else if ( res.status === 200 ) {
			if (urlParams.get('cat') == 'NewCategory') {
				history.push(`/formdetails?cat=${category}`);
			} else {
				loadFetch(category);
			}
			setNotificationType(notificationsVariants['hazardForm-update-success']);
		} else {
			setNotificationType(notificationsVariants['hazardForm-update-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return <Box>
			{user.isAdmin ? <><Typography
									gutterBottom>{urlParams.get('cat') == 'NewCategory' ?
				t(`hazardFormControl.Create`) :
				t(`hazardFormControl.Modify`)} <strong>{hazardFormDetails?.hazard_category.hazard_category_name}</strong> ({t(`hazardFormControl.newVersionCurrentIs`)} <strong>{hazardFormDetails?.version}</strong>)
			</Typography>
			<div style={{display: "flex", flexDirection: 'row'}}>
				<div className="col-9">
					{urlParams.get('cat') == 'NewCategory' && <TextField
			  onChange={(event => {setCategory(event.target.value)})}
			  autoFocus
			  required={urlParams.get('cat') == 'NewCategory'}
			  margin="dense"
			  id="category"
			  name="category"
			  label={t(`hazardFormControl.newHazardCategory`)}
			  fullWidth
			  variant="standard"
		  />}

					{urlParams.get('cat') != 'NewCategory'  && <div style={{marginBottom: '5px'}}></div>}

					{(newForm || hazardFormDetails?.form || urlParams.get('cat') == 'NewCategory') &&
							<LHDv3FormBuilder
								form={(newForm || hazardFormDetails?.form) ? JSON.parse(newForm ?? hazardFormDetails!.form) : {}}
								onChange={(schema) => {setNewForm(JSON.stringify(schema))}}
							/>}
					<div style={{marginTop: '50px'}}>
						<Button
							onClick={handleSubmit}
							label={t(`generic.saveButton`)}
							iconName={`#save`}
							primary/>
					</div>
				</div>
				<div className="col-3">
					{hazardFormDetails?.children &&
							<HazardFormChildList hazardFormChildList={hazardFormDetails.children}
																	 category={hazardFormDetails?.hazard_category.hazard_category_name}/>}
				</div>
			</div>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/></> : <b>You are not authorized for this page</b>}
		</Box>
}
