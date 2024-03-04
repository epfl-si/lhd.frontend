import {Box, Button, TextField, Typography} from '@material-ui/core';
import {FormControlLabel, Stack} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import {fetchHazardCategory, fetchRoomDetails, fetchRoomTypes, fetchUnits} from '../utils/graphql/FetchingTools';
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
import '../../css/styles.scss'
import "epfl-elements-react/src/stories/molecules/formCard.css";
import {updateRoom} from "../utils/graphql/PostingTools";
import {notificationsVariants} from "../utils/ressources/variants";
import Notifications from "../components/Table/Notifications";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {MultipleSelection} from "../components/global/MultipleSelection";
import {useTranslation} from "react-i18next";
import "formiojs/dist/formio.full.min.css";
import {HazardTab} from "../components/RoomDetails/HazardTab";

export default function RoomDetails() {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<roomDetailsType | null>(null);
	const [roomKind, setRoomKind] = React.useState<kindType[]>([]);
	const [savedUnits, setSavedUnits] = useState<lhdUnitsType[]>([]);
	const [selectedUnits, setSelectedUnits] = useState<lhdUnitsType[]>([]);
	const [forceRender, setForceRender] = useState(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);

	useEffect(() => {
		if (forceRender)
			setForceRender(false);
	}, [forceRender, selectedUnits]);

	useEffect(() => {
		loadFetch();
	}, [oidc.accessToken, window.location.search]);

	const loadFetch = async () => {
		const urlParams = new URLSearchParams(window.location.search);

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
				setSelectedUnits(results.data[0].lhd_units);
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
	};

	function saveRoomDetails() {
		updateRoom(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			formatData(),
			{}
		).then(res => {
			handleOpen(res);
			setSavedUnits(selectedUnits.filter(u => u.status !== 'Deleted'));
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
		setSelectedUnits(changedUnits);
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
			<Typography variant="h5" gutterBottom>{t(`room_details.title`).concat(data?.name)}</Typography>
			<Tabs>
				<Tabs.Tab id="details">
					<Tabs.Tab.Title>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
								<use xlinkHref={`${featherIcons}#users`}></use>
							</svg>
							<span className="tab-text-title">{t(`room_details.details`)}</span>
						</div>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						<Stack spacing={2} width="30%">
							<Autocomplete
								value={data?.kind?.name || ''}
								onChange={(event: any, newValue: string | null) => {
									if ( data && data.kind && newValue ) {
										data.kind.name = newValue;
										setForceRender(true);
									}
								}}
								id="designation"
								options={roomKind.flatMap(k => k.name)}
								renderInput={(params) => <TextField {...params} label={t(`room_details.designation`)} />}
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
							<MultipleSelection selected={savedUnits} objectName="Unit" onChangeSelection={onChangeUnits}/>

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
				<Tabs.Tab id="hazards">
					<Tabs.Tab.Title>
						<div style={{display: 'flex', justifyContent: 'center', flexDirection: "column"}}>
							<div>
								<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
									<use xlinkHref={`${featherIcons}#users`}></use>
								</svg>
								<span className="tab-text-title">{t(`room_details.hazards`)}</span>
							</div>
							<div style={{display: "flex", justifyContent: "center"}}>
								<img style={{margin: '5px', width: '30px', height: '30px'}}
										 src="../../public/pictogrammes/02_radiation_ionisante.svg"/>
							</div>
						</div>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						{data && <HazardTab room={data} />}
					</Tabs.Tab.Content>
				</Tabs.Tab>
			</Tabs>
		</Box>
	);
}
