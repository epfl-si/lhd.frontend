import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {
	authorizationType,
	lhdUnitsType,
	notificationType,
	personType,
	roomDetailsType, sourceType
} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {MenuItem, Select, TextField} from "@material-ui/core";
import {Autocomplete, SelectChangeEvent} from "@mui/material";
import {saveNewRadioprotection, updateRadioprotection} from '../../utils/graphql/PostingTools';
import {fetchPeopleFromFullText, fetchRooms, fetchunitsFromFullText} from "../../utils/graphql/FetchingTools";
import {MultipleSelection} from "../global/MultipleSelection";
import {SubUnits} from "../Units/SubUnitsList";
import {Source} from "./SourceList";

interface AddNewRadioprotectionDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
	selectedRadioprotection?: authorizationType;
}

export const AddNewRadioprotectionDialog = ({
																			 openDialog,
																			 close,
																			 save,
																			 selectedRadioprotection
																		 }: AddNewRadioprotectionDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const now = new Date();
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [unit, setUnit] = useState<lhdUnitsType | undefined>(selectedRadioprotection?.unit);
	const [name, setName] = useState<string>(selectedRadioprotection ? selectedRadioprotection.authorization : "");
	const [expDate, setExpDate] = useState<Date>(selectedRadioprotection ? selectedRadioprotection.expiration_date : new Date(now.getFullYear()+1,now.getMonth(),now.getDate()));
	const [creationDate, setCreationDate] = useState<Date>(selectedRadioprotection ? selectedRadioprotection.creation_date : new Date());
	const [renewals, setRenewals] = useState<number>(selectedRadioprotection ? selectedRadioprotection.renewals : 0);
	const [status, setStatus] = useState<string>(selectedRadioprotection ? selectedRadioprotection.status : 'Active');
	const [authority, setAuthority] = useState<string | undefined>(selectedRadioprotection?.authority);
	const [unitList, setUnitList] = useState<lhdUnitsType[]>([]);
	const [savedRooms, setSavedRooms] = useState<roomDetailsType[]>([]);
	const [selectedRooms, setSelectedRooms] = useState<roomDetailsType[]>([]);
	const [savedHolders, setSavedHolders] = useState<personType[]>([]);
	const [selectedHolders, setSelectedHolders] = useState<personType[]>([]);
	const [savedSources, setSavedSources] = useState<sourceType[]>([]);
	const [selectedSources, setSelectedSources] = useState<sourceType[]>([]);

	useEffect(() => {
		setUnit(selectedRadioprotection?.unit);
		setName(selectedRadioprotection ? selectedRadioprotection.authorization : "");
		setExpDate(selectedRadioprotection ? selectedRadioprotection.expiration_date : new Date(now.getFullYear()+1,now.getMonth(),now.getDate()));
		setCreationDate(selectedRadioprotection ? selectedRadioprotection.creation_date : new Date());
		setRenewals(selectedRadioprotection ? selectedRadioprotection.renewals : 0);
		setStatus(selectedRadioprotection ? selectedRadioprotection.status : 'Active');
		setAuthority(selectedRadioprotection?.authority);

		setSavedRooms(selectedRadioprotection ? selectedRadioprotection.authorization_rooms : []);
		setSelectedRooms(selectedRadioprotection ? selectedRadioprotection.authorization_rooms : []);

		setSavedHolders(selectedRadioprotection ? selectedRadioprotection.authorization_holders : []);
		setSelectedHolders(selectedRadioprotection ? selectedRadioprotection.authorization_holders : []);

		setSavedSources(selectedRadioprotection ? selectedRadioprotection.authorization_radiations : []);
		setSelectedSources(selectedRadioprotection ? selectedRadioprotection.authorization_radiations : []);
		fetchUnitsList("");
	}, [openDialog, selectedRadioprotection]);

	const fetchUnitsList = async (newValue: string) => {
		const results = await fetchunitsFromFullText(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			newValue
		);
		if (results.status === 200) {
			if (results.data) {
				setUnitList(results.data);
			} else {
				console.error('Bad GraphQL results', results);
			}
		}
	};

	async function onAddRadioprotection() {
		if ( unit && name != '' && creationDate != expDate) {
			const radioprotection = {unit,name,expDate,creationDate,renewals,status,
				authority,selectedSources,selectedHolders,selectedRooms};
			if (selectedRadioprotection) {
				updateRadioprotection(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					JSON.stringify(selectedRadioprotection.id),
					radioprotection
				).then(res => {
					handleOpen(res, false);
				});
			} else {
				saveNewRadioprotection(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					radioprotection
				).then(res => {
					handleOpen(res, true);
				});
			}
		} else {
			setNotificationType(notificationsVariants['no-radioprotection-chosen']);
			setOpenNotification(true);
		}
	}

	function onChangeRoom(changedRooms: roomDetailsType[]) {
		setSelectedRooms(changedRooms);
	}

	function onChangeHolder(changedHolders: personType[]) {
		setSelectedHolders(changedHolders);
	}

	const handleOpen = (res: any, saveNew: boolean) => {
		if (saveNew ? res.data?.addRadioprotection?.errors : res.data?.updateRadioprotection?.errors ) {
			const notif: notificationType = {
				text: saveNew ? res.data?.addRadioprotection?.errors[0].message : res.data?.updateRadioprotection?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else {
			setNotificationType(notificationsVariants['save-new-radioprotection-success']);
			save(name);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	const formatDate = (date: Date) => {
		try {
			if (!date) return "";
			date = new Date(date);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		} catch ( e ) {
			return date;
		}
	};

	function getRoomTitle(room: roomDetailsType) {
		return room.name;
	}

	const fetchRoomList = async (newValue: string): Promise<roomDetailsType[]> => {
		const results = await fetchRooms(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
			100,0, "Room=" + newValue
		);
		if (results.status === 200) {
			if (results.data) {
				return results.data.rooms;
			} else {
				console.error('Bad GraphQL results', results);
			}
		}
		return [];
	};

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

	function getPersonTitle(person: personType) {
		return person.name + ' ' + person.surname;
	}

	function onChangeSources(changedSources: sourceType[]) {
		setSelectedSources(changedSources);
	}

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={onAddRadioprotection}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={selectedRadioprotection ? t('authorization.modifyRadioprotection') : t('authorization.addRadioprotection')}
									 type='selection'>
				<div style={{display: "flex", flexDirection: "column"}}>
					<Autocomplete
						value={unit}
						onChange={(event: any, newValue: lhdUnitsType) => {setUnit(newValue)}}
						getOptionLabel={(option) => option.name}
						options={unitList}
						style={{flex: '1', margin: "5px"}}
						renderInput={(params) => <TextField label={t('authorization.unit')} {...params} />}
					/>
					<div style={{display: "flex", flexDirection: "row"}}>
						<TextField
							label={t('authorization.authorization')}
							fullWidth
							required
							value={name}
							onChange={(event) => setName(event.target.value)}
							style={{flex: '1', margin: "5px"}}
						/>
						<TextField
							label={t('authorization.authority')}
							fullWidth
							value={authority}
							onChange={(event) => setAuthority(event.target.value)}
							style={{flex: '1', margin: "5px"}}
						/>
					</div>
					<div style={{display: "flex", flexDirection: "row", marginBottom: '10px'}}>
						<TextField
							label={t('authorization.created')}
							type="date"
							disabled
							value={formatDate(creationDate)}
							onChange={(e) => setCreationDate(new Date(e.target.value))}
							style={{flex: '1', margin: "5px"}}
						/>
						<TextField
							label={t('authorization.expires')}
							type="date"
							value={formatDate(expDate)}
							onChange={(e) => setExpDate(new Date(e.target.value))}
							style={{flex: '1', margin: "5px"}}
						/>
						<TextField
							label={t('authorization.renewals')}
							value={renewals}
							disabled
							style={{flex: '1', margin: "5px"}}
						/>
						<Select
							value={status}
							style={{flex: '1', margin: "5px"}}
							onChange={(event: SelectChangeEvent) => {
								setStatus(event.target.value)
							}}
							label={t("authorization.status")}
						>
							<MenuItem value={t("authorization.statusActive")}>{t("authorization.statusActive")}</MenuItem>
							<MenuItem value={t("authorization.statusExpired")}>{t("authorization.statusExpired")}</MenuItem>
						</Select>
					</div>
					<div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: '10px'}}>
						<div style={{flex: '1', margin: "5px"}}>
							<MultipleSelection selected={savedRooms} objectName="NewRoom"
																 onChangeSelection={onChangeRoom}
																 getCardTitle={getRoomTitle}
																 fetchData={fetchRoomList}/>
						</div>
						<div style={{flex: '1', margin: "5px"}}>
							<MultipleSelection selected={savedHolders}
																 onChangeSelection={onChangeHolder}
																 objectName="Person"
																 getCardTitle={getPersonTitle}
																 fetchData={fetchPeople}/>
						</div>
						<div style={{flex: '1', margin: "5px"}}>
							<Source selected={savedSources} onChangeSelection={onChangeSources}/>
						</div>
					</div>
				</div>
			</AlertDialog>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
