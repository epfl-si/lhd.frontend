import {Box, Typography} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { env } from '../utils/env.js';
import { useOpenIDConnectContext } from '@epfl-si/react-appauth';
import {
	notificationType, lhdUnitsType, personType
} from '../utils/ressources/types';
import '../../css/styles.css'
import {notificationsVariants} from "../utils/ressources/variants";
import {fetchUnitDetails} from "../utils/graphql/FetchingTools";
import {ResponsiveTabs} from "epfl-elements-react/src/stories/molecules/ResponsiveTabs.tsx";
import Notifications from "../components/Table/Notifications";
import {MultipleSelection} from "../components/global/MultipleSelection";
import {SubUnits} from "../components/Units/SubUnitsList";
import {updateUnit} from "../utils/graphql/PostingTools";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {useTranslation} from "react-i18next";

export default function UnitDetails() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<lhdUnitsType[]>([]);

	const [savedProfs, setSavedProfs] = useState<personType[]>([]);
	const [savedCosecs, setSavedCosecs] = useState<personType[]>([]);
	const [savedSubUnits, setSavedSubUnits] = useState<lhdUnitsType[]>([]);
	const [selectedProfs, setSelectedProfs] = useState<personType[]>([]);
	const [selectedCosecs, setSelectedCosecs] = useState<personType[]>([]);
	const [selectedSubUnits, setSelectedSubUnits] = useState<lhdUnitsType[]>([]);

	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);

		const fetchData = async () => {
			const results = await fetchUnitDetails(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				urlParams.get('unit'),
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
						}
					}
				} else {
					console.error('Bad GraphQL results', results);
				}
			}
		}
		fetchData();
	}, [oidc.accessToken, window.location.search]);

	function getUnitTitle(unit: lhdUnitsType) {
		const unitName: string = unit?.name || '';
		const instituteName: string = unit?.institute?.name ? unit.institute.name + ' ' : '';
		const schoolName: string = unit?.institute?.school?.name ? unit.institute.school.name + ' ' : '';

		return schoolName + instituteName + unitName;
	}

	function saveUnitDetails() {
		updateUnit(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			{unit: data[0]?.name, profs: selectedProfs, cosecs: selectedCosecs, subUnits: selectedSubUnits},
			{}
		).then(res => {
			console.log(res.data);
			if(res.status == 200 && !res.data?.updateUnit?.errors) {
				setSavedCosecs(selectedCosecs.filter(u => u.status !== 'Deleted'));
				setSavedProfs(selectedProfs.filter(u => u.status !== 'Deleted'));
				setSavedSubUnits(selectedSubUnits.filter(u => u.status !== 'Deleted'));
			}
			handleOpen(res);
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
		if (res.data?.updateUnit?.errors) {
			const n = notificationsVariants['unit-update-error'];
			const notif: notificationType = {
				text: n.text.concat(' \n').concat(res.data?.updateUnit?.errors[0].message),
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

	return (
		<Box>
			<Typography variant="h5" gutterBottom>{t(`unit_details.title`)} {getUnitTitle(data[0])}</Typography>

			<ResponsiveTabs
				cardStyle={{
					background: 'white',
					fontSize: 'small'
				}}
			>
				<ResponsiveTabs.Tab key="profTab" id="profTab">
					<ResponsiveTabs.Tab.Title>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
								<use xlinkHref={`${featherIcons}#user`}></use>
							</svg>
							<span className="tab-text-title">{t(`unit_details.profTab`)}</span>
						</div>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>
						<MultipleSelection selected={savedProfs} onChangeSelection={onChangeProfs} objectName="Person"/>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
				<ResponsiveTabs.Tab key="cosec" id="cosec">
					<ResponsiveTabs.Tab.Title>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
								<use xlinkHref={`${featherIcons}#shield`}></use>
							</svg>
							<span className="tab-text-title">{t(`unit_details.cosecTab`)}</span>
						</div>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>
						<MultipleSelection selected={savedCosecs} onChangeSelection={onChangeCosecs} objectName="Person"/>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
				{
					data[0]?.unitId ? (<ResponsiveTabs.Tab key="subunits" id="subunits" >
							<ResponsiveTabs.Tab.Title>
								<div style={{display: 'flex', justifyContent: 'center'}}>
									<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
										<use xlinkHref={`${featherIcons}#layers`}></use>
									</svg>
									<span className="tab-text-title">{t(`unit_details.subunitTab`)}</span>
								</div>
							</ResponsiveTabs.Tab.Title>
							<ResponsiveTabs.Tab.Content>
								<SubUnits selected={savedSubUnits} onChangeSelection={onChangeSubUnits} parentName={data[0]?.name}/>
							</ResponsiveTabs.Tab.Content>
						</ResponsiveTabs.Tab>) : <></>
				}
			</ResponsiveTabs>

			<div style={{marginTop: '50px'}}>
				<Button
					onClick={() => saveUnitDetails()}
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
