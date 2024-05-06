import * as React from 'react';
import {useEffect, useState} from 'react';
import {hazardFormChildType, notificationType} from "../utils/ressources/types";
import {useTranslation} from "react-i18next";
import {FormBuilder} from "@formio/react";
import {Box, TextField, Typography} from "@material-ui/core";
import {fetchHazardFormChild} from "../utils/graphql/FetchingTools";
import {env} from "../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import {useHistory} from "react-router-dom";
import {getOrganism} from "../components/formio/OrganismDropDown";
import {
	createNewHazardFormChild,
	updateHazardFormChild
} from "../utils/graphql/PostingTools";
import semver from "semver/preload";
import {BackButton} from "../components/global/BackButton";
import {compareVersions, findAllKeysForSubmission} from "../utils/ressources/jsonUtils";

export default function HazardFormChildDetails() {
	const history = useHistory();
	const {t} = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [hazardFormChildDetails, setHazardFormChildDetails] = useState<hazardFormChildType>();
	const [newForm, setNewForm] = useState<string>();
	const [name, setName] = useState<string>('');
	const [category, setCategory] = useState<string>('');
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [componentNameList, setComponentNameList] = useState<string>('');
	const [componentOptionList, setComponentOptionList] = useState<object[]>([]);
	const [formBuilderOptions,setFormBuilderOption] = useState<{component: string, options: any}>({
		component: componentNameList,
		options: {
			builder: {
				custom: {
					title: 'LHD Fields',
					components: {
						componentOptionList
					}
				}
			}
		}
	});
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const urlParams = new URLSearchParams(window.location.search);
	const [originalForm, setOriginalForm] = useState<string>();

	useEffect(() => {
		setName(urlParams.get('name') ?? '');
		setCategory(urlParams.get('category') ?? '');
		if ( urlParams.get('name') != 'NewHazardFormChild' ) {
			loadFetch(urlParams.get('name') ?? '');
		}
		loadOrganism();
	}, [oidc.accessToken, window.location.search]);

	const loadOrganism = async () => {
		const organism = await getOrganism(oidc.accessToken);
		setComponentNameList(componentNameList + organism.component);
		setComponentOptionList([...componentOptionList, organism.options]);
		setFormBuilderOption({
			component: componentNameList + organism.component,
			options: {
				builder: {
					custom: {
						title: 'LHD Fields',
						components: {...componentOptionList, organism: organism.options}
					}
				}
			}
		})
	}

	const loadFetch = async (name: string) => {
		const results = await fetchHazardFormChild(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			name
		);
		if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
			setHazardFormChildDetails(results.data[0]);
			setNewForm(JSON.stringify(results.data[0].form));
			setName(results.data[0].hazard_form_child_name);
			setCategory(results.data[0].parentForm.hazard_category.hazard_category_name);
			setOriginalForm(results.data[0].form);
		} else {
			console.error('Bad GraphQL results', results);
		}
	}

	const handleSubmit = () => {
		if (name != '' && newForm && newForm != '') {
			if (urlParams.get('name') == 'NewHazardFormChild') {
				createNewHazardFormChild (
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					{
						id: JSON.stringify('{"salt":"NewHazardFormChild","eph_id":"NewHazardFormChild"}'),
						form: JSON.stringify(newForm),
						version: '1.0.0',
						hazard_form_child_name: name,
						category: category
					}
				).then(res => {
					handleOpen(res);
				});
			} else {
				const originalFormKeys = findAllKeysForSubmission(JSON.parse(originalForm ?? ''));
				const newFormKeys = findAllKeysForSubmission(JSON.parse(newForm));
				const newVersion = compareVersions(originalFormKeys, newFormKeys, hazardFormChildDetails?.version);
				updateHazardFormChild (
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					{
						id: JSON.stringify(hazardFormChildDetails?.id),
						form: JSON.stringify(newForm),
						version: newVersion,
						hazard_form_child_name: name
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
		if ( res.data?.createNewHazardFormChild?.errors ) {
			const notif: notificationType = {
				text: res.data?.createNewHazardFormChild?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else if ( res.status === 200 ) {
			if ( urlParams.get('cat') == 'NewHazardFormChild' ) {
				history.push(`/hazardFormChildDetails?name=${name}`);
			} else {
				loadFetch(name);
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

	return (
		<Box>
			<BackButton icon="#arrow-left" onClickButton={() => {history.push(`/formdetails?cat=${category}`)}} alwaysPresent={true}/>
			<Typography
				gutterBottom><strong>{hazardFormChildDetails?.hazard_form_child_name}</strong> ({t(`hazardFormControl.newVersionCurrentIs`)} <strong>{hazardFormChildDetails?.version}</strong>)
			</Typography>
			{urlParams.get('name') == 'NewHazardFormChild' && <TextField
		  onChange={(event => {setName(event.target.value)})}
		  autoFocus
		  required={urlParams.get('name') == 'NewHazardFormChild'}
		  margin="dense"
		  id="name"
		  name="name"
		  label={t(`hazardFormControl.NewHazardFormChild`)}
		  fullWidth
		  variant="standard"
	  />}
			{(newForm || hazardFormChildDetails?.form) && <FormBuilder
		  key={formBuilderOptions.component}
		  options={formBuilderOptions?.options}
		  form={(newForm || hazardFormChildDetails?.form) ? JSON.parse(newForm ?? hazardFormChildDetails!.form) : {}}
		  onChange={(schema) => {
						setNewForm(JSON.stringify(schema))
					}}
	  />}
			<div style={{marginTop: '50px'}}>
				<Button
					onClick={handleSubmit}
					label={t(`generic.saveButton`)}
					iconName={`${featherIcons}#save`}
					primary/>
			</div>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</Box>
	);
}
