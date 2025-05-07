import {Box, Typography} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import {env} from '../utils/env.js';
import {useOpenIDConnectContext} from '@epfl-si/react-appauth';
import {lhdUnitsType, notificationType, personType} from '../utils/ressources/types';
import '../../css/styles.scss'
import {notificationsVariants} from "../utils/ressources/variants";
import {fetchPeopleFromFullText, fetchUnitDetails} from "../utils/graphql/FetchingTools";
import {ResponsiveTabs} from "epfl-elements-react/src/stories/molecules/ResponsiveTabs.tsx";
import Notifications from "../components/Table/Notifications";
import {MultipleSelection} from "../components/global/MultipleSelection";
import {SubUnits} from "../components/Units/SubUnitsList";
import {deleteUnit, updateUnit} from "../utils/graphql/PostingTools";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {useTranslation} from "react-i18next";
import {Redirect, useHistory} from "react-router-dom";
import {AlertDialog} from "../components/global/AlertDialog";
import {UnitTabTitle} from "../components/Units/UnitTabTitle";
import {BackButton} from "../components/global/BackButton";
import {Text} from "epfl-elements-react/src/stories/molecules/inputFields/Text";
import {DeleteUnitDialog} from "../components/Units/DeleteUnitDialog";

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

		if (results.status === 200) {
			if (results.data) {
				if (typeof results.data !== 'string') {
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
				}
			} else {
				console.error('Bad GraphQL results', results);
			}
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
			if(res.status == 200 && !res.data?.updateUnit?.errors) {
				fetchData();
			}
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
		if (res.data?.updateUnit?.errors || res.data?.deleteUnit?.errors) {
			const n = notificationsVariants['unit-update-error'];
			const notif: notificationType = {
				text: n.text.concat(' \n').concat(res.data?.updateUnit?.errors ?
					res.data?.updateUnit?.errors[0].message :
					res.data?.deleteUnit?.errors[0].message),
				type: n.type
			};
			setNotificationType(notif);
		} else if (res.status === 200) {
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
				console.error('Bad GraphQL results', results);
			}
		}
		return [];
	};

	return (
		<div>
			<BackButton icon="#arrow-left" onClickButton={() => {history.push("/unitcontrol")}} alwaysPresent={false}/>
			<Typography style={{display:"flex"}} gutterBottom>
				{
					(data[0]?.unitId ? '' :
						<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
							<use xlinkHref={`${featherIcons}#layers`}></use>
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
			</ResponsiveTabs>

			<div style={{marginTop: '50px'}}>
				<Button
					onClick={() => setOpenDialog(true)}
					label={t(`generic.deleteButton`)}
					iconName={`${featherIcons}#trash`}
					primary/>
				<Button
					onClick={() => saveUnitDetails()}
					label={t(`generic.saveButton`)}
					iconName={`${featherIcons}#save`}
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
