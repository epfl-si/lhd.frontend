import {Box, TextField, Typography} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { env } from '../utils/env.js';
import { useOpenIDConnectContext } from '@epfl-si/react-appauth';
import {
	notificationType, lhdUnitsType, personType
} from '../utils/ressources/types';
import '../../css/styles.css'
import {notificationsVariants} from "../utils/ressources/variants";
import {fetchUnitDetails, fetchUnits} from "../utils/graphql/FetchingTools";
import {Tabs} from "epfl-elements-react/src/stories/molecules/Tabs.tsx";
import {Autocomplete, FormControlLabel, Stack, Switch} from "@mui/material";
import Notifications from "../components/Table/Notifications";
import {MultipleSelection} from "../components/Units/personSelection";

export default function UnitDetails() {
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<lhdUnitsType[]>([]);

	const [listOfPersons, setListfPerson] = useState<personType[]>([]);
	const [savedProfs, setSavedProfs] = useState<personType[]>([]);
	const [savedCosecs, setSavedCosecs] = useState<personType[]>([]);

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
						}
					}
				} else {
					console.error('Bad GraphQL results', results);
				}
			}
		}

		fetchData().catch(console.error);
	}, [oidc.accessToken, window.location.search]);

	function getUnitTitle(unit: lhdUnitsType) {
		const unitName: string = unit?.name || '';
		const instituteName: string = unit?.institute?.name ? unit.institute.name + ' ' : '';
		const schoolName: string = unit?.institute?.school?.name ? unit.institute.school.name + ' ' : '';

		return schoolName + instituteName + unitName;
	}

	function saveUnitDetails() {
		/*updateUnit(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			formatData(),
			{}
		).then(res => {
			if (res.status === 200) {
				setNotificationType(notificationsVariants['unit-update-success']);
			} else {
				setNotificationType(notificationsVariants['unit-update-error']);
			}
			setOpenNotification(true);
		});*/
	}

	/*const formatData = (): unitDetailsForSaveType => {
		let unit: unitDetailsForSaveType = {};

		return room;
	};*/

	const handleClose = (event: Event, reason: string) => {
		if (reason === 'clickaway') return;
		setOpenNotification(false);
	};

	return (
		<Box>
			<Typography variant="h5" gutterBottom>Details on unit {getUnitTitle(data[0])}</Typography>
			<Tabs>
				<Tabs.Tab id="profTab">
					<Tabs.Tab.Title>
						<span style={{fontWeight: 'bold'}}>Prof / Resp</span>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						<Stack spacing={2} width="30%">
							<MultipleSelection all={listOfPersons} selected={savedProfs} />
						</Stack>
					</Tabs.Tab.Content>
				</Tabs.Tab>
				<Tabs.Tab id="cosec">
					<Tabs.Tab.Title>
						<span style={{fontWeight: 'bold'}}>COSECs</span>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						<Stack spacing={2} width="30%">
							<MultipleSelection all={listOfPersons} selected={savedCosecs} />
						</Stack>
					</Tabs.Tab.Content>
				</Tabs.Tab>
				<Tabs.Tab id="subunits">
					<Tabs.Tab.Title>
						<span style={{fontWeight: 'bold'}}>Sub-Units</span>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>

					</Tabs.Tab.Content>
				</Tabs.Tab>
			</Tabs>
		</Box>
	);
}
