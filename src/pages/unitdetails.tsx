import {Typography} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {env} from '../utils/env.js';
import {useOpenIDConnectContext} from '@epfl-si/react-appauth';
import {lhdUnitsType, notificationType, personType, profile} from '../utils/ressources/types';
import '../../css/styles.scss'
import {notificationsVariants} from "../utils/ressources/variants";
import {fetchPeopleFromFullText, fetchUnitDetails} from "../utils/graphql/FetchingTools";
import {Button, FormCard, ResponsiveTabs, Text} from "epfl-elements-react-si-extra";
import Notifications from "../components/Table/Notifications";
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
import {getFormattedDate} from "../utils/ressources/parser";
import {MultipleSelectionForProfile} from "../components/Units/MultipleSelectionForProfile";

export default function UnitDetails() {
	const { t } = useTranslation();
	const history = useHistory();
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<lhdUnitsType>();
	const [savedProfiles, setSavedProfiles] = useState<profile[]>([]);
	const [selectedProfiles, setSelectedProfiles] = useState<profile[]>([]);
	const [savedSubUnits, setSavedSubUnits] = useState<lhdUnitsType[]>([]);
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
			env().REACT_APP_BACKEND_ENDPOINT_URL,
			oidc.accessToken,
			decodeURIComponent(urlParams.get('unit') as string),
			{}
		);

		if (results.status === 200 && results.data) {
			setData(results.data);
			setSavedProfiles(results.data?.profiles);
			setSelectedProfiles(results.data?.profiles);
			setSavedSubUnits(results.data.subUnits);
			setSelectedSubUnits(results.data.subUnits);
			setInputValueForEdit(results.data.name.substring(results.data.name.indexOf('(') + 1, results.data.name.indexOf(')')));
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
		let newName: string = data?.unitId ? data?.name : data?.name.replace(/\(.*?\)/, `(${inputValueForEdit})`);
		updateUnit(
			env().REACT_APP_BACKEND_ENDPOINT_URL,
			oidc.accessToken,
			{opLock: JSON.stringify(data?.opLock), unit: newName, profiles: selectedProfiles, subUnits: selectedSubUnits},
		).then(res => {
			setOpenDialogEdit(false);
			handleOpen(res);
			if (!data?.unitId && newName != data?.name) {
				history.push(`/unitdetails?unit=${encodeURIComponent(newName)}`);
			}
		});
	}

	function onChangeProfiles(changedPerson: profile[]) {
		setSelectedProfiles(changedPerson);
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

	function getPersonTitle(person: profile) {
		if (person.expirationDate) {
			return `${person.role == 'Professor' ? '🎓' : '⛑️'} ${person.person.name} ${person.person.surname} - ${getFormattedDate(new Date(person.expirationDate))}`;
		} else {
			return `⭐ ${person.role == 'Professor' ? '🎓' : '⛑️'} ${person.person.name} ${person.person.surname}`;
		}
	}

	function getSuggestionTitle(person: personType) {
		return `${person.name} ${person.surname}`;
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
		return `https://epfl.service-now.com/now/nav/ui/classic/params/target/u_scc_ticket_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOu_requester_as.u_unitLIKE${data?.name}%26sysparm_query_encoded%3DGOTOu_requester_as.u_unitLIKE${data?.name}%26sysparm_view%3D`;
	}

	function getSNOWLinkForUnitAccidents() {
		return `https://epfl.service-now.com/sc_req_item_list.do?sysparm_query=cat_item%3Dccbe6d4187038110252bece60cbb35bc%5Eu_caller_as.u_unitLIKE${data?.name}`;
	}

	return (
		<div>
			<BackButton icon="#arrow-left" onClickButton={() => {history.push("/unitcontrol")}} alwaysPresent={false}/>
			<Typography style={{display:"flex"}} gutterBottom>
				{
					(data?.unitId ? '' :
						<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
							<use xlinkHref={`#layers`}></use>
						</svg>)
				} {(t(`unit_details.title`)).concat(' ').concat(getUnitTitle(data))}
				{(data?.unitId ? '' :
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
						<MultipleSelectionForProfile selected={savedProfiles}
																				 onChangeSelection={onChangeProfiles}
																				 getCardTitle={getPersonTitle}
																				 fetchData={fetchPeople}
																				 getSuggestionTitle={getSuggestionTitle}/>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
				{
					data?.unitId ? (<ResponsiveTabs.Tab key="subunits" id="subunits">
						<ResponsiveTabs.Tab.Title>
							<UnitTabTitle title={t(`unit_details.subunitTab`)} icon='#layers'/>
						</ResponsiveTabs.Tab.Title>
						<ResponsiveTabs.Tab.Content>
							<SubUnits selected={savedSubUnits} onChangeSelection={onChangeSubUnits} parentName={data?.name}/>
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
						<FormCard keyValue='linkSnow'>
							<a target="_blank" href={getSNOWLinkForUnitAccidents()} rel="noreferrer">{t(`unit_details.linkUnitTicketsSnow`)}</a>
						</FormCard>
						<FormCard keyValue='rooms'>
							<a target="_blank" href={`/roomcontrol?Unit=${data?.name}`} rel="noreferrer">{t(`unit_details.rooms`)}</a>
						</FormCard>
						<FormCard keyValue='radioAuth'>
							<a target="_blank" href={`/radioprotectionauthorizationscontrol?Unit=${data?.name}`} rel="noreferrer">{t(`unit_details.radioAuth`)}</a>
						</FormCard>
						<FormCard keyValue='chemAuth'>
							<a target="_blank" href={`/chemicalauthorizationscontrol?Unit=${data?.name}`} rel="noreferrer">{t(`unit_details.chemAuth`)}</a>
						</FormCard>
						<FormCard keyValue='dispensation'>
							<a target="_blank" href={`/dispensationscontrol?Unit=${data?.name}`} rel="noreferrer">{t(`unit_details.dispensation`)}</a>
						</FormCard>
						<FormCard keyValue='assessment'>
							<a target="_blank" href={`/assessmentscontrol?Unit=${data?.name}`} rel="noreferrer">{t(`unit_details.assessment`)}</a>
						</FormCard>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
			</ResponsiveTabs>
			<AuditReportPanel lhd_units={data ? [data] : []} style={{marginLeft: '20px'}}/>
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
			<DeleteUnitDialog unit={data}
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
