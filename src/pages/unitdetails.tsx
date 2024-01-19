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
import {MultipleSelection} from "../components/Units/MultipleSelection";
import {updateUnit} from "../utils/graphql/PostingTools";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";

export default function UnitDetails() {
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<lhdUnitsType[]>([]);

	const [savedProfs, setSavedProfs] = useState<personType[]>([]);
	const [savedCosecs, setSavedCosecs] = useState<personType[]>([]);

	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	let selectedProfs: personType[] = [];
	let selectedCosecs: personType[] = [];

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
							selectedCosecs = results.data[0]?.cosecs;
							selectedProfs = results.data[0]?.professors;
							debugger;
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
		debugger;
		updateUnit(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			{unit: data[0]?.name, profs: selectedProfs, cosecs: selectedCosecs},
			{}
		).then(res => {
			setSavedCosecs(selectedCosecs);
			setSavedProfs(selectedProfs);
			handleOpen(res);
		});
	}

	function onChangeProfs(changedPerson: personType[]) {
		selectedProfs = (changedPerson.filter(u => u.status !== 'Deleted'));
	}

	function onChangeCosecs(changedPerson: personType[]) {
		selectedCosecs = (changedPerson.filter(u => u.status !== 'Deleted'));
	}

	const handleOpen = (res: any) => {
		if (res.status === 200) {
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
			<Typography variant="h5" gutterBottom>Details on unit {getUnitTitle(data[0])}</Typography>

			<ResponsiveTabs
				cardStyle={{
					background: 'white',
					fontSize: 'small'
				}}
			>
				<ResponsiveTabs.Tab id="profTab">
					<ResponsiveTabs.Tab.Title>
						<b>Prof / Resp</b>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>
						<MultipleSelection selected={savedProfs} onChangeSelection={onChangeProfs} objectName="Person"/>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
				<ResponsiveTabs.Tab id="cosec">
					<ResponsiveTabs.Tab.Title>
						<b>COSECs</b>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>
						<MultipleSelection selected={savedCosecs} onChangeSelection={onChangeCosecs} objectName="Person"/>
					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
				<ResponsiveTabs.Tab id="subunits">
					<ResponsiveTabs.Tab.Title>
						<b>Sub-Units</b>
					</ResponsiveTabs.Tab.Title>
					<ResponsiveTabs.Tab.Content>

					</ResponsiveTabs.Tab.Content>
				</ResponsiveTabs.Tab>
			</ResponsiveTabs>

			<div style={{marginTop: '50px'}}>
				<Button
					onClick={() => saveUnitDetails()}
					label="Save"
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
