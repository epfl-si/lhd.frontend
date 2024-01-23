import {Box, Button, TextField, Typography} from '@material-ui/core';
import {FormControlLabel, Stack} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {fetchRoomDetails, fetchRoomTypes, fetchUnits} from '../utils/graphql/FetchingTools';
import { env } from '../utils/env.js';
import { useOpenIDConnectContext } from '@epfl-si/react-appauth';
import {
	lhdUnitsType,
	roomDetailsType,
	kindType,
	notificationType
} from '../utils/ressources/types';
import { Tabs } from 'epfl-elements-react/src/stories/molecules/Tabs.tsx';
import { Button } from 'epfl-elements-react/src/stories/molecules/Button.tsx'
import { Autocomplete, Switch } from '@mui/material';
import '../../css/styles.css'
import "epfl-elements-react/src/stories/molecules/formCard.css";
import {updateRoom} from "../utils/graphql/PostingTools";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {MultipleSelection} from "../components/global/MultipleSelection";

export default function RoomDetails() {
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<roomDetailsType | null>(null);
	const [roomKind, setRoomKind] = React.useState<kindType[]>([]);
	const [units, setUnits] = useState<lhdUnitsType[]>([]);
	const [savedUnits, setSavedUnits] = useState<lhdUnitsType[]>([]);
	const [forceRender, setForceRender] = useState(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	let selectedUnits: lhdUnitsType[] = [];

	useEffect(() => {
		if (forceRender)
			setForceRender(false);
	}, [forceRender, selectedUnits]);

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const loadFetch = async () => {
			const results = await fetchRoomDetails(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				urlParams.get('room'),
				{}
			);
			if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
				setData(results.data[0]);
				if (results.data[0].lhd_units) {
					setSavedUnits(results.data[0].lhd_units);
					selectedUnits = (results.data[0].lhd_units);
				}
				setForceRender(true);
			} else {
				console.error('Bad GraphQL results', results);
			}

			const resultsRoomTypes = await fetchRoomTypes(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken
			);

			if (resultsRoomTypes.status === 200 && resultsRoomTypes.data && typeof resultsRoomTypes.data !== 'string') {
				setRoomKind(resultsRoomTypes.data);
			}

			const resultsUnits = await fetchUnits(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken
			);

			if (resultsUnits.status === 200 && resultsUnits.data && typeof resultsUnits.data !== 'string') {
				setUnits(resultsUnits.data);
			}
		};
		loadFetch();
	}, [oidc.accessToken, window.location.search]);

	function saveRoomDetails() {
		updateRoom(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			formatData(),
			{}
		).then(res => {
			handleOpen(res);
			setSavedUnits(selectedUnits);
		});
	}

	const formatData = (): roomDetailsType => {
		let room: roomDetailsType = {
			name: data?.name || '',
			kind: data?.kind,//designation
			vol: data?.vol,//volume
			vent: data?.vent,//ventilation
			lhd_units: selectedUnits,
		};
		return room;
	};

	function onChangeUnits(changedUnits: lhdUnitsType[]) {
		selectedUnits = (changedUnits.filter(u => u.status !== 'Deleted'));
	}

	const handleOpen = (res: any) => {
		if (res.status === 200) {
			setNotificationType(notificationsVariants['room-update-success']);
		} else {
			setNotificationType(notificationsVariants['room-update-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
				<Box>
					<Typography variant="h5" gutterBottom>Details on room {data?.name}</Typography>
					<Tabs>
						<Tabs.Tab id="details">
							<Tabs.Tab.Title>
								<span style={{fontWeight: 'bold'}}>Details</span>
							</Tabs.Tab.Title>
							<Tabs.Tab.Content>
								<Stack spacing={2} width="30%">
									<Autocomplete
										value={data?.kind?.name || ''}
										onChange={(event: any, newValue: string | null) => {
											if (data && data.kind && newValue) {
												data.kind.name = newValue;
												setForceRender(true);
											}
										}}
										id="designation"
										options={roomKind.flatMap(k => k.name)}
										renderInput={(params) => <TextField {...params} label="Designation" />}
									/>
									<TextField
										id="volume"
										label="Volume"
										type="number"
										InputLabelProps={{
											shrink: true,
										}}
										variant="standard"
										value={data?.vol || 0}
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											if (data) {
												data.vol = parseInt(event.target.value);
												setForceRender(true);
											}
										}}
									/>
									<FormControlLabel
										control={
											<Switch
												id="ventilation"
												checked={data?.vent === 'y'}
												name="ventilation"
												onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
													if (data) {
														data.vent = event.target.checked ? 'y' : 'n';
														setForceRender(true);
													}
												}}/>
										}
										label="Ventilation"
									/>
									<MultipleSelection all={units} selected={savedUnits} objectName="Unit" onChangeSelection={onChangeUnits}/>

									<div style={{marginTop: '50px'}}>
										<Button
											onClick={() => saveRoomDetails()}
											label="Save"
											iconName={`${featherIcons}#save`}
											primary />
									</div>

								</Stack>
								<Notifications
									open={openNotification}
									notification={notificationType}
									close={handleClose}
								/>
							</Tabs.Tab.Content>
						</Tabs.Tab>
						<Tabs.Tab id="2">
							<Tabs.Tab.Title>
								<span style={{fontWeight: 'bold'}}>Hazards</span>
							</Tabs.Tab.Title>
							<Tabs.Tab.Content>

							</Tabs.Tab.Content>
						</Tabs.Tab>
					</Tabs>
				</Box>
	);
}
