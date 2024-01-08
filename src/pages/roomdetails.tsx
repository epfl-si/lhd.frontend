import {Box, Button, Card, CardContent, TextField, Typography} from '@material-ui/core';
import {FormControlLabel, Stack} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DetailRow from '../components/RoomDetails/DetailRow';
import DetailDrawer from '../components/RoomDetails/DetailDrawer';
import {fetchRoomDetails, fetchRoomTypes, fetchUnits} from '../utils/graphql/FetchingTools';
import { env } from '../utils/env.js';
import { useOpenIDConnectContext } from '@epfl-si/react-appauth';
import {
	lhdUnitsType,
	roomDetailsType,
	kindType,
	lhdUnitsSimpleType,
	dispensationRequestType, roomDetailsForSaveType
} from '../utils/ressources/types';
import DispensationTable from '../components/RoomDetails/DispensationTable';
import { Tabs } from 'epfl-elements-react/src/stories/molecules/Tabs.tsx';
import { Card } from 'epfl-elements-react/src/stories/molecules/Card.tsx';
import { Button } from 'epfl-elements-react/src/stories/molecules/Button.tsx'
import { Autocomplete, Switch } from '@mui/material';
import '../../css/styles.css'
import {updateDispensation, updateRoom} from "../utils/graphql/PostingTools";
import {notificationsVariants} from "../utils/ressources/variants";

export default function RoomDetails() {
	const oidc = useOpenIDConnectContext();
	const [data, setData] = useState<roomDetailsType[]>([]);
	const [designation, setDesignation] = React.useState<string | null>(null);
	const [designationInputValue, setDesignationInputValue] = React.useState('');
	const [volume, setVolume] = React.useState<number>(0);
	const [ventilation, setVentilation] = React.useState<boolean>(false);
	const [roomKind, setRoomKind] = useState<kindType[]>([]);
	const [units, setUnits] = useState<lhdUnitsType[]>([]);
	const [selectedUnits, setSelectedUnits] = useState<lhdUnitsType[]>([]);
	const [savedUnits, setSavedUnits] = useState<lhdUnitsType[]>([]);
	const [unit, setUnit] = React.useState<string | null>(null);
	const [unitInputValue, setUnitInputValue] = React.useState('');

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const loadFetch = async () => {
			const results = await fetchRoomDetails(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				urlParams.get('room'),
				{}
			);
			if (results.status === 200) {
				if (results.data) {
					if (typeof results.data !== 'string') {
						setData(results.data);
						if (results.data[0]?.kind) {
							setDesignation(results.data[0]?.kind?.name);
						}
						if (results.data[0]?.vol) {
							setVolume(results.data[0]?.vol);
						}
						if (results.data[0]?.vent) {
							setVentilation(results.data[0]?.vent === 'y');
						}
						if (results.data[0]?.lhd_units) {
							setSelectedUnits(results.data[0]?.lhd_units);
							setSavedUnits(results.data[0]?.lhd_units);
						}
					}
				} else {
					console.error('Bad GraphQL results', results);
				}
			}
			const resultsRoomTypes = await fetchRoomTypes(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken
			);

			if (resultsRoomTypes.status === 200) {
				if ( resultsRoomTypes.data ) {
					setRoomKind(resultsRoomTypes.data);
				}
			}

			const resultsUnits = await fetchUnits(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken
			);

			if (resultsUnits.status === 200) {
				if ( resultsUnits.data ) {
					setUnits(resultsUnits.data);
				}
			}
		};
		loadFetch();
	}, [oidc.accessToken]);

	function getUnitTitle(unit: lhdUnitsType) {
		return (unit.institute?.school?.name).concat(' ').concat(unit.institute?.name).concat(' ').concat(unit.name);
	}

	function saveRoomDetails() {
		updateRoom(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			formatData(),
			{}
		).then(res => {
			console.log(res.status)
			if (res.status === 200) {
				//setNotificationType(notificationsVariants['disp-update-success']);
				//setOpenNotification(true);
			}
		});
	}

	const formatData = (): roomDetailsForSaveType => {
		let room: roomDetailsForSaveType = {};
		room.name = data[0]?.name;
		room.kind = designation;
		room.vol = volume;
		room.vent = ventilation ? 'y' : 'n';
		const unitIds = selectedUnits.map(u => u.id);
		room.lhd_units = unitIds;
		console.log('test', room);
		return room;
	};

	return (
		<Box>
			<Typography variant="h5" gutterBottom>Details on room {data[0]?.name}</Typography>
			<Tabs>
				<Tabs.Tab id="1">
					<Tabs.Tab.Title>
						<span style={{fontWeight: 'bold'}}>Details</span>
					</Tabs.Tab.Title>
					<Tabs.Tab.Content>
						<Stack spacing={2} width="30%">
							<Autocomplete
								value={designation}
								onChange={(event: any, newValue: string | null) => {
									setDesignation(newValue);
								}}
								inputValue={designationInputValue}
								onInputChange={(event, newInputValue) => {
									setDesignationInputValue(newInputValue);
								}}
								id="designation"
								options={roomKind.flatMap(k => k.name)}
								renderInput={(params) => <TextField {...params} label="Designation" />}
							/>
							<TextField
								id="standard-number"
								label="Volume"
								type="number"
								InputLabelProps={{
									shrink: true,
								}}
								variant="standard"
								value={volume}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setVolume(event.target.value);
								}}
							/>
							<FormControlLabel
								control={
									<Switch
										checked={ventilation}
										name="ventilation"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											setVentilation(event.target.checked);
										}}/>
								}
								label="Ventilation"
							/>

							<Autocomplete
								value={unit}
								onChange={(event: any, newValue: string | null) => {
									setUnit(newValue);
									if (newValue) {
										const selectedUnit = units.find(u => u.name === newValue);
										setSelectedUnits([...selectedUnits, selectedUnit]);
									}
								}}
								inputValue={unitInputValue}
								onInputChange={(event, newInputValue) => {
									setUnitInputValue(newInputValue);
								}}
								id="unit"
								options={units.flatMap(k => k.name)}
								renderInput={(params) => <TextField {...params} label="Chose unit" />}
							/>

							{selectedUnits.map(unit => {
								return (<Card
									icon="#trash-2"
									onClickIcon={() => {}}
									onClickItem={() => {}}
									title={getUnitTitle(unit)}
									className={savedUnits.find(u => u.name == unit.name) ? 'solid_card' : 'dashed-card'}
								>
									<div>
										<small className="text-muted">
											<b>Prof:</b> {unit.professors?.map(professor => professor.name.concat(' ').concat(professor.surname)).join(', ')}
										</small>
										<br />
										<small className="text-muted">
											<b>Cosec:</b> {unit.cosecs?.map(cosec => cosec.name.concat(' ').concat(cosec.surname)).join(', ')}
										</small>
									</div>
								</Card>)
							})}

							<div style={{marginTop: '50px'}}>
								<Button
								onClick={() => saveRoomDetails()}
								primary
							>
								<svg
									aria-hidden="true"
									className="icon"
								>
									<use xlinkHref="#save" />
								</svg>
								<span
									style={{
										marginLeft: '5px'
									}}
								>
									Save
								</span>
							</Button>
							</div>

						</Stack>
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

/*



		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			flexDirection="column"
			gridGap={16}
		>
			<Typography variant="h3">Details on room {data[0]?.name}</Typography>
			<Card style={{ minWidth: 350, width: '30%' }}>
				<CardContent>
					<Typography variant="caption">Basic information on room</Typography>
					<Stack>
						<DetailRow title="Designation" value={data[0]?.kind?.name} />
						<DetailRow
							title="Cosec"
							value={data[0]?.occupancies[0]?.cosecs?.map(e => e.name).join(', ')}
						/>
						<DetailRow
							title="Professor/Responsible"
							value={data[0]?.occupancies[0]?.professors
								?.map(e => e.name)
								.join(', ')}
						/>
						<DetailRow title="Unit" value={data[0]?.occupancies[0]?.unit?.name} />
						<DetailRow
							title="Number of audits per year"
							value={data[0]?.yearly_audits?.toString()}
						/>
						<Button color="secondary">Access ISIDOR</Button>
					</Stack>
				</CardContent>
			</Card>
			<Box width="100%">
				<DetailDrawer title="Audit Reports">none</DetailDrawer>
				<DetailDrawer title="Hazards">none</DetailDrawer>
				<DetailDrawer title="Authorisations">none</DetailDrawer>
				<DetailDrawer title="Dispensations">
					{data[0]?.dispensations?.length !== 0 && (
						<DispensationTable data={data[0]?.dispensations} />
					)}
				</DetailDrawer>
				<DetailDrawer title="Cadastre">none</DetailDrawer>
				<DetailDrawer title="Supplies interruptions">none</DetailDrawer>
			</Box>
		</Box>*/
// dispensations {
// 	slug
// 	versions {
// 		subject
// 		date_end
// 		status
// 		holders {
// 			name
// 		}
// 	}
// }
