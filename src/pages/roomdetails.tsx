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
import {Form, submission} from '@formio/react';
import "formiojs/dist/formio.full.min.css";
import {HazardCard} from "../components/RoomDetails/HazardCard";
import laser from "../../public/pictogrammes/04_Risque biologique.svg"

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
	const [openHazard, setOpenHazard] = useState<boolean>(false);

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

		const resultsHazardCategory = await fetchHazardCategory(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);

		/*if (resultsHazardCategory.status === 200 && resultsHazardCategory.data && typeof resultsHazardCategory.data !== 'string') {
			setHazardCategory(resultsHazardCategory.data);
		}*/
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

	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event) => {
			console.log(event);
	};

	function onOpenHazard(hazard: string) {
		setOpenHazard(true);
		console.log(hazard);
	}

	return (
				<Box>
					<Typography variant="h5" gutterBottom>Details on room {data?.name}</Typography>
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
						<Tabs.Tab id="2">
							<Tabs.Tab.Title>
								<div style={{display: 'flex', justifyContent: 'center', flexDirection: "column"}}>
									<div>
										<svg aria-hidden="true" className="icon feather" style={{margin: '3px'}}>
											<use xlinkHref={`${featherIcons}#users`}></use>
										</svg>
										<span className="tab-text-title">{t(`room_details.hazards`)}</span>
									</div>
									<div style={{display: "flex", justifyContent: "center"}}>
										{data?.haz_levels.map(h => {
											return <img style={{margin: '5px', width: '30px', height: '30px'}} key={h.haz_type.haz_en}
																	src="../../public/pictogrammes/02_radiation ionisante.svg"/>
										})}
									</div>
								</div>
							</Tabs.Tab.Title>
							<Tabs.Tab.Content>
								<div style={{ display: 'flex', flexDirection: 'row'}}>
									<div style={{width: '30%'}}>
										<HazardCard hazardName="Biological"
																onClick={(e) => onOpenHazard("Biological")}/>
										<HazardCard hazardName="Chemical"
																onClick={(e) => onOpenHazard("Chemical")}/>
										<HazardCard hazardName="Compressed Gas"
																onClick={(e) => onOpenHazard("Compressed Gas")}/>
										<HazardCard hazardName="Cryogenics"
																onClick={(e) => onOpenHazard("Cryogenics")}/>
										<HazardCard hazardName="Electrical"
																onClick={(e) => onOpenHazard("Electrical")}/>
										<HazardCard hazardName="EM Radiation"
																onClick={(e) => onOpenHazard("EM Radiation")}/>
										<HazardCard hazardName="Ionising radiation"
																onClick={(e) => onOpenHazard("Ionising radiation")}/>
										<HazardCard hazardName="Laser"
																onClick={(e) => onOpenHazard("Laser")}/>
										<HazardCard hazardName="Static magnetic field"
																onClick={(e) => onOpenHazard("Static magnetic field")}/>
										<HazardCard hazardName="Nanoparticles"
																onClick={(e) => onOpenHazard("Nanoparticles")}/>
										<HazardCard hazardName="Noise"
																onClick={(e) => onOpenHazard("Noise")}/>
										<HazardCard hazardName="Temperature"
																onClick={(e) => onOpenHazard("Temperature")}/>
									</div>
									<div style={{width: '70%', padding: '50px'}}>
										<div style={{display: 'flex', flexDirection: 'column'}}>
											<div style={{display: 'flex', flexDirection: 'row', marginBottom: '20px'}}>
												<img style={{margin: '5px', width: '30px', height: '30px'}}
														 src={laser}/>
												<strong style={{marginLeft: '10px'}}>Laser</strong>
											</div>
											<Form
												onCustomEvent={handleSubmit}
												submission={{
													"data": {
														"laserClass": 2,
														"laserMode": "continuousWave",
														"laserWavelengthNm": 244,
														"laserPowerW": 0.00095,
														"laserEnergyJ": 0.00001,
														"laserPulseLengthNs": 0.000055,
														"laserFrequencyHz": 1000000,
														"submit": true,
														"sdsdfsdf": ""
													}
												}}
												form={{
													"_id": "65d4938d88d3c6899c680522",
													"title": "Laser",
													"name": "laser",
													"path": "laser",
													"type": "form",
													"display": "form",
													"tags": [],
													"access": [
														{
															"type": "create_own",
															"roles": []
														},
														{
															"type": "create_all",
															"roles": []
														},
														{
															"type": "read_own",
															"roles": []
														},
														{
															"type": "read_all",
															"roles": [
																"65d379960c6d1170d990c001",
																"65d379960c6d1170d990c005",
																"65d379960c6d1170d990c009"
															]
														},
														{
															"type": "update_own",
															"roles": []
														},
														{
															"type": "update_all",
															"roles": []
														},
														{
															"type": "delete_own",
															"roles": []
														},
														{
															"type": "delete_all",
															"roles": []
														},
														{
															"type": "team_read",
															"roles": []
														},
														{
															"type": "team_write",
															"roles": []
														},
														{
															"type": "team_admin",
															"roles": []
														}
													],
													"submissionAccess": [
														{
															"type": "create_own",
															"roles": []
														},
														{
															"type": "create_all",
															"roles": []
														},
														{
															"type": "read_own",
															"roles": []
														},
														{
															"type": "read_all",
															"roles": []
														},
														{
															"type": "update_own",
															"roles": []
														},
														{
															"type": "update_all",
															"roles": []
														},
														{
															"type": "delete_own",
															"roles": []
														},
														{
															"type": "delete_all",
															"roles": []
														},
														{
															"type": "team_read",
															"roles": []
														},
														{
															"type": "team_write",
															"roles": []
														},
														{
															"type": "team_admin",
															"roles": []
														}
													],
													"owner": "65d3795157392cc4e2361ddd",
													"settings": {},
													"properties": {},
													"project": "65d379960c6d1170d990bff8",
													"controller": "",
													"revisions": "current",
													"submissionRevisions": "",
													"_vid": 1,
													"created": "2024-02-20T11:57:01.095Z",
													"modified": "2024-02-20T12:29:29.390Z",
													"machineName": "voezkptdqlanjgr:laser",
													"plan": "trial",
													"components": [
														{
															"label": "Laser class",
															"widget": "choicesjs",
															"tableView": true,
															"data": {
																"values": [
																	{
																		"label": "1",
																		"value": "1"
																	},
																	{
																		"label": "1M",
																		"value": "1M"
																	},
																	{
																		"label": "2",
																		"value": "2"
																	},
																	{
																		"label": "2M",
																		"value": "2M"
																	},
																	{
																		"label": "3B",
																		"value": "3B"
																	},
																	{
																		"label": "3R",
																		"value": "3R"
																	},
																	{
																		"label": "4",
																		"value": "4"
																	}
																]
															},
															"key": "laserClass",
															"type": "select",
															"input": true
														},
														{
															"label": "Laser mode",
															"widget": "choicesjs",
															"tableView": true,
															"data": {
																"values": [
																	{
																		"label": "Continuous-wave",
																		"value": "continuousWave"
																	},
																	{
																		"label": "Pulsed",
																		"value": "pulsed"
																	}
																]
															},
															"key": "laserMode",
															"type": "select",
															"input": true
														},
														{
															"label": "Laser wavelength [nm]",
															"widget": "choicesjs",
															"tableView": true,
															"dataSrc": "json",
															"data": {
																"json": [
																	"193",
																	"220",
																	"244",
																	"258",
																	"266",
																	"280",
																	"325",
																	"343",
																	"355",
																	"356",
																	"375",
																	"400",
																	"405",
																	"410",
																	"425",
																	"445",
																	"454",
																	"455",
																	"470",
																	"473",
																	"485",
																	"488",
																	"500",
																	"510",
																	"515",
																	"517",
																	"520",
																	"527",
																	"528",
																	"532",
																	"533",
																	"561",
																	"620",
																	"630",
																	"632",
																	"633",
																	"635",
																	"638",
																	"640",
																	"641",
																	"642",
																	"644",
																	"647",
																	"649",
																	"655",
																	"658",
																	"660",
																	"670",
																	"680",
																	"690",
																	"697",
																	"750",
																	"775",
																	"780",
																	"785",
																	"800",
																	"808",
																	"810",
																	"850",
																	"900",
																	"920",
																	"960",
																	"980",
																	"1000",
																	"1028",
																	"1030",
																	"1040",
																	"1053",
																	"1064",
																	"1070",
																	"1515",
																	"1550",
																	"1560",
																	"1600",
																	"2000",
																	"2090",
																	"2300",
																	"3000",
																	"6000",
																	"9600",
																	"10600"
																]
															},
															"dataType": "number",
															"key": "laserWavelengthNm",
															"type": "select",
															"input": true
														},
														{
															"label": "Laser power [W]",
															"widget": "choicesjs",
															"tableView": true,
															"dataSrc": "json",
															"data": {
																"json": [
																	"0.00015",
																	"0.0005",
																	"0.00095",
																	"0.001",
																	"0.0019",
																	"0.005",
																	"0.01",
																	"0.015",
																	"0.017",
																	"0.02",
																	"0.03",
																	"0.04",
																	"0.05",
																	"0.06",
																	"0.08",
																	"0.088",
																	"0.1",
																	"0.11",
																	"0.147",
																	"0.15",
																	"0.18",
																	"0.2",
																	"0.25",
																	"0.3",
																	"0.4",
																	"0.48",
																	"0.495",
																	"0.5",
																	"0.75",
																	"0.99",
																	"1",
																	"1.5",
																	"2",
																	"2.4",
																	"2.5",
																	"3",
																	"3.5",
																	"4",
																	"4.4",
																	"5",
																	"6",
																	"8",
																	"10",
																	"12",
																	"15",
																	"16",
																	"16.5",
																	"18",
																	"20",
																	"25",
																	"32",
																	"40",
																	"50",
																	"90",
																	"100",
																	"150",
																	"200",
																	"350",
																	"400",
																	"500",
																	"1200"
																]
															},
															"key": "laserPowerW",
															"type": "select",
															"input": true
														},
														{
															"label": "Laser energy [J]",
															"widget": "choicesjs",
															"tableView": true,
															"dataSrc": "json",
															"data": {
																"json": [
																	"0.000000005",
																	"0.00000001",
																	"0.000000025",
																	"0.00001",
																	"0.00003",
																	"0.00005",
																	"0.00007",
																	"0.0002",
																	"0.4",
																	"0.8",
																	"1.5"
																]
															},
															"key": "laserEnergyJ",
															"type": "select",
															"input": true
														},
														{
															"label": "Laser pulse length [ns]",
															"widget": "choicesjs",
															"tableView": true,
															"dataSrc": "json",
															"data": {
																"json": [
																	"0.00000000000001",
																	"0.00000001",
																	"0.000001",
																	"0.000035",
																	"0.000055",
																	"0.0001",
																	"0.00015",
																	"0.00019",
																	"0.0002",
																	"0.00029",
																	"0.1",
																	"1",
																	"5",
																	"10",
																	"20",
																	"100",
																	"100000",
																	"1000000"
																]
															},
															"key": "laserPulseLengthNs",
															"type": "select",
															"input": true
														},
														{
															"label": "Laser frequency [Hz]",
															"widget": "choicesjs",
															"tableView": true,
															"dataSrc": "json",
															"data": {
																"json": [
																	"10",
																	"15",
																	"20",
																	"1000",
																	"20000",
																	"200000",
																	"1000000",
																	"10000000",
																	"40000000",
																	"76000000",
																	"80000000"
																]
															},
															"key": "laserFrequencyHz",
															"type": "select",
															"input": true
														},
														{
															"label": "Submit",
															"action": "event",
															"disableOnInvalid": true,
															"tableView": false,
															"key": "submit",
															"type": "button",
															"input": true,
															"showValidations": false,
															"event": "onClick"
														}
													]
												}}/>
										</div>
									</div>
								</div>
							</Tabs.Tab.Content>
						</Tabs.Tab>
					</Tabs>
				</Box>
	);
}
