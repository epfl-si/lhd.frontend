import {Typography} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {env} from '../utils/env.js';
import {useOpenIDConnectContext} from '@epfl-si/react-appauth';
import {lhdUnitsType, notificationType, personType} from '../utils/ressources/types';
import '../../css/styles.scss'
import {notificationsVariants} from "../utils/ressources/variants";
import {fetchPeopleFromFullText, fetchUnitDetails} from "../utils/graphql/FetchingTools";
import {Button, FormCard, ResponsiveTabs, Text} from "epfl-elements-react-si-extra";
import Notifications from "../components/Table/Notifications";
import {MultipleSelection} from "../components/global/MultipleSelection";
import {SubUnits} from "../components/Units/SubUnitsList";
import {updateUnit} from "../utils/graphql/PostingTools";
import {useTranslation} from "react-i18next";
import {Redirect, useHistory} from "react-router-dom";
import {AlertDialog} from "../components/global/AlertDialog";
import {UnitTabTitle} from "../components/Units/UnitTabTitle";
import {BackButton} from "../components/global/BackButton";
import {DeleteUnitDialog} from "../components/Units/DeleteUnitDialog";
import {AuditReportPanel} from "../components/Units/AuditReportPanel";
import {getErrorMessage} from "../utils/graphql/Utils";

export default function UnitDetails() {
	const { t } = useTranslation();
	const history = useHistory();
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<lhdUnitsType[]>([]);

	const [savedProfs, setSavedProfs] = useState<personType[]>([]);
	const [savedCosecs, setSavedCosecs] = useState<personType[]>([]);
	const [savedSubUnits, setSavedSubUnits] = useState<lhdUnitsType[]>([]);
	const [selectedProfs, setSelectedProfs] = useState<personType[]>([]);
	const [selectedCosecs, setSelectedCosecs] = useState<personType[]>([]);
	const [selectedSubUnits, setSelectedSubUnits] = useState<lhdUnitsType[]>([]);
	const [deleted, setDeleted] = useState(false);

	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
	const [inputValueForEdit, setInputValueForEdit] = React.useState('');

	useEffect(() => {
		fetchData();
	}, [oidc.accessToken, window.location.search]);

	const fetchData = async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const results = await fetchUnitDetails(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			decodeURIComponent(urlParams.get('unit') as string),
			{}
		);

		if (results.status === 200 && results.data && typeof results.data !== 'string') {
			setData(results.data);
			if (results.data[0]) {
				setSavedProfs(results.data[0]?.professors);
				setSavedCosecs(results.data[0]?.cosecs);
				setSavedSubUnits(results.data[0].subUnits);
				setSelectedCosecs(results.data[0]?.cosecs);
				setSelectedProfs(results.data[0]?.professors);
				setSelectedSubUnits(results.data[0].subUnits);
				setInputValueForEdit(results.data[0].name.substring(results.data[0].name.indexOf('(') + 1, results.data[0].name.indexOf(')')));
			}
		} else {
			const errors = getErrorMessage(results, 'units');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
	}

	function getUnitTitle(unit: lhdUnitsType) {
		const unitName: string = unit?.name || '';
		const instituteName: string = unit?.institute?.name ? unit.institute.name + ' ' : '';
		const schoolName: string = unit?.institute?.school?.name ? unit.institute.school.name + ' ' : '';
		const unitType: string = unit?.unitType || '';

		return schoolName + instituteName + unitName + (unitType != '' ? (' (' + unitType + ')') : '');
	}

	function saveUnitDetails() {
		let newName: string = data[0]?.unitId ? data[0]?.name : data[0]?.name.replace(/\(.*?\)/, `(${inputValueForEdit})`);
		updateUnit(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			{id: JSON.stringify(data[0]?.id), unit: newName, profs: selectedProfs, cosecs: selectedCosecs, subUnits: selectedSubUnits},
		).then(res => {
			setOpenDialogEdit(false);
			handleOpen(res);
			if (!data[0]?.unitId && newName != data[0]?.name) {
				history.push(`/unitdetails?unit=${encodeURIComponent(newName)}`);
			}
		});
	}

	function onChangeProfs(changedPerson: personType[]) {
		setSelectedProfs(changedPerson);
	}

	function onChangeCosecs(changedPerson: personType[]) {
		setSelectedCosecs(changedPerson);
	}

	function onChangeSubUnits(changedSubUnit: lhdUnitsType[]) {
		setSelectedSubUnits(changedSubUnit);
	}

	const handleOpen = (res: any) => {
		const errors = getErrorMessage(res, 'updateUnit');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else if (res.status === 200) {
			fetchData();
			setNotificationType(notificationsVariants['unit-update-success']);
		} else {
			setNotificationType(notificationsVariants['unit-update-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	function getPersonTitle(person: personType) {
		return person.name + ' ' + person.surname;
	}

	const fetchPeople = async (newValue: string): Promise<personType[]> => {
		const results = await fetchPeopleFromFullText(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			newValue
		);
		if (results.status === 200) {
			if (results.data) {
				return results.data;
			} else {
				const errors = getErrorMessage(results, 'personFullText');
				setNotificationType(errors.notif);
				setOpenNotification(true);
			}
		}
		return [];
	};

	function getSNOWLinkForUnit() {
		return `https://epfl.service-now.com/now/nav/ui/classic/params/target/u_scc_ticket_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOu_requester_as.u_unitLIKE${data[0]?.name}%26sysparm_query_encoded%3DGOTOu_requester_as.u_unitLIKE${data[0]?.name}%26sysparm_view%3D`;
	}

	return (
		<div>
			<BackButton icon="#arrow-left" onClickButton={() => {history.push("/unitcontrol")}} alwaysPresent={false}/>
			<Typography style={{display:"flex"}} gutterBottom>
				{
					(data[0]?.unitId ? '' :
						<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
							<use xlinkHref={`#layers`}></use>
						</svg>)
				} {(t(`unit_details.title`)).concat(' ').concat(getUnitTitle(data[0]))}
				{(data[0]?.unitId ? '' :
				<Button
					style={{marginLeft: '10px'}}
					onClick={() => setOpenDialogEdit(true)}
					size="icon"
					iconName="#edit-2"/>)}
			</Typography>

			<ResponsiveTabs
				cardStyle={{
					background: 'white',
					fontSize: 'small'
				}}
			>
				<ResponsiveTabs.Tab key="profTab" id="profTab">
					<ResponsiveTabs.Tab.Title>
						<UnitTabTitle title={t(`unit_details.profTab`)} icon='#user'/>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>
						<MultipleSelection selected={savedProfs}
															 onChangeSelection={onChangeProfs}
															 objectName="Person"
															 getCardTitle={getPersonTitle}
															 fetchData={fetchPeople}
															 unitResponsible={data[0]?.responsible?.sciper}
						/>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
				<ResponsiveTabs.Tab key="cosec" id="cosec">
					<ResponsiveTabs.Tab.Title>
						<UnitTabTitle title={t(`unit_details.cosecTab`)} icon='#shield'/>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>
						<MultipleSelection selected={savedCosecs}
															 onChangeSelection={onChangeCosecs}
															 objectName="Person"
															 getCardTitle={getPersonTitle}
															 fetchData={fetchPeople}/>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
			</ResponsiveTabs>
			<ResponsiveTabs
				cardStyle={{
					background: 'white',
					fontSize: 'small'
				}}
			>
				{
					data[0]?.unitId ? (<ResponsiveTabs.Tab key="subunits" id="subunits">
						<ResponsiveTabs.Tab.Title>
							<UnitTabTitle title={t(`unit_details.subunitTab`)} icon='#layers'/>
						</ResponsiveTabs.Tab.Title>
						<ResponsiveTabs.Tab.Content>
							<SubUnits selected={savedSubUnits} onChangeSelection={onChangeSubUnits} parentName={data[0]?.name}/>
						</ResponsiveTabs.Tab.Content>
					</ResponsiveTabs.Tab>) : <></>
				}
				<ResponsiveTabs.Tab key="links" id="linksTab">
					<ResponsiveTabs.Tab.Title>
						<UnitTabTitle title={t(`unit_details.links`)} icon='#user'/>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>
						<FormCard keyValue='linkSnow'>
							<a target="_blank" href={getSNOWLinkForUnit()} rel="noreferrer">{t(`unit_details.linkSnow`)}</a>
						</FormCard>
						<FormCard keyValue='rooms'>
							<a target="_blank" href={`/roomcontrol?Unit=${data[0]?.name}`} rel="noreferrer">{t(`unit_details.rooms`)}</a>
						</FormCard>
						<FormCard keyValue='radioAuth'>
							<a target="_blank" href={`/radioprotectionauthorizationscontrol?Unit=${data[0]?.name}`} rel="noreferrer">{t(`unit_details.radioAuth`)}</a>
						</FormCard>
						<FormCard keyValue='chemAuth'>
							<a target="_blank" href={`/chemicalauthorizationscontrol?Unit=${data[0]?.name}`} rel="noreferrer">{t(`unit_details.chemAuth`)}</a>
						</FormCard>
						<FormCard keyValue='dispensation'>
							<a target="_blank" href={`/dispensationscontrol?Unit=${data[0]?.name}`} rel="noreferrer">{t(`unit_details.dispensation`)}</a>
						</FormCard>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
			</ResponsiveTabs>
			<AuditReportPanel lhd_units={data} style={{marginLeft: '20px'}}/>
			<div style={{marginTop: '50px', display: "flex", flexDirection: "row"}}>
				<Button
					onClick={() => setOpenDialog(true)}
					label={t(`generic.deleteButton`)}
					iconName={`#trash`}
					primary/>
				<Button
					onClick={() => saveUnitDetails()}
					label={t(`generic.saveButton`)}
					iconName={`#save`}
					style={{marginLeft: '10px'}}
					primary/>
			</div>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
			{deleted ? <Redirect to="/unitcontrol"/> : <></>}
			<DeleteUnitDialog unit={data[0]}
												openDialog={openDialog}
												setOpenDialog={setOpenDialog}
												setDeleted={setDeleted}
			/>
			<AlertDialog openDialog={openDialogEdit}
									 onOkClick={() => saveUnitDetails()}
									 onCancelClick={() => setOpenDialogEdit(false)}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={t('unit_details.editName')}
									 type='selection'>
				<Text
					name="input_subUnitEdit"
					id="input_subUnitEdit"
					onChange={(newValue: string) => setInputValueForEdit(newValue)}
					placeholder={t('unit_details.editName')}
					type="text"
					value={inputValueForEdit}
					style={{flex: 'auto'}}
				/>
			</AlertDialog>
		</div>
	);
}
