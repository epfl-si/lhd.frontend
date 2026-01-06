import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {
	dispensationType,
	notificationType,
	personType,
	roomDetailsType, genericType
} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {MenuItem, Select, TextField} from "@material-ui/core";
import {SelectChangeEvent} from "@mui/material";
import {saveNewDispensation, updateDispensation} from '../../utils/graphql/PostingTools';
import {fetchDispensationSubjects, fetchDispensations, fetchPeopleFromFullText, fetchRooms} from "../../utils/graphql/FetchingTools";
import {MultipleSelection} from "../global/MultipleSelection";
import {getErrorMessage} from "../../utils/graphql/Utils";
import {Source} from '../radioprotection/SourceList';

interface AddNewDispensationDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
	selectedDispensation?: dispensationType;
}

export const AddNewDispensationDialog = ({
																			 openDialog,
																			 close,
																			 save,
																			 selectedDispensation
																		 }: AddNewDispensationDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const now = new Date();
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [expDate, setExpDate] = useState<Date>(selectedDispensation ? selectedDispensation.date_end : new Date(now.getFullYear()+1,now.getMonth(),now.getDate()));
	const [creationDate, setCreationDate] = useState<Date>(selectedDispensation ? selectedDispensation.date_start : new Date());
	const [renewals, setRenewals] = useState<number>(selectedDispensation ? selectedDispensation.renewals : 0);
	const [status, setStatus] = useState<string>(selectedDispensation ? selectedDispensation.status : 'Active');
	const [subject, setSubject] = useState<string | undefined>(selectedDispensation?.subject);
	const [savedRooms, setSavedRooms] = useState<roomDetailsType[]>([]);
	const [selectedRooms, setSelectedRooms] = useState<roomDetailsType[]>([]);
	const [savedHolders, setSavedHolders] = useState<personType[]>([]);
	const [selectedHolders, setSelectedHolders] = useState<personType[]>([]);
	const [savedTickets, setSavedTickets] = useState<genericType[]>([]);
	const [selectedTickets, setSelectedTickets] = useState<genericType[]>([]);
	const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

	useEffect(() => {
		loadSubjects();
		setExpDate(selectedDispensation ? selectedDispensation.date_end : new Date(now.getFullYear()+1,now.getMonth(),now.getDate()));
		setCreationDate(selectedDispensation ? selectedDispensation.date_start : new Date());
		setRenewals(selectedDispensation ? selectedDispensation.renewals : 0);
		setStatus(selectedDispensation ? selectedDispensation.status : 'Draft');
		setSubject(selectedDispensation?.subject);

		setSavedRooms(selectedDispensation ? selectedDispensation.dispensation_rooms : []);
		setSelectedRooms(selectedDispensation ? selectedDispensation.dispensation_rooms : []);

		setSavedHolders(selectedDispensation ? selectedDispensation.dispensation_holders : []);
		setSelectedHolders(selectedDispensation ? selectedDispensation.dispensation_holders : []);

		setSavedTickets(selectedDispensation ? selectedDispensation.dispensation_tickets : []);
		setSelectedTickets(selectedDispensation ? selectedDispensation.dispensation_tickets : []);
	}, [openDialog, selectedDispensation]);

	const loadSubjects = async () => {
		const results = await fetchDispensationSubjects(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);
		if (results.status === 200 && results.data){
			setAvailableSubjects(results.data.map(disp => disp.subject));
		} else {
			const errors = getErrorMessage(results, 'dispensationsWithPagination');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
	};

	async function onAddDispensation() {
		if (creationDate != expDate) {
			const dispensation = {expDate,creationDate,renewals,status,
				subject,selectedTickets,selectedHolders,selectedRooms};
			if (selectedDispensation) {
				updateDispensation(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					JSON.stringify(selectedDispensation.id),
					dispensation
				).then(res => {
					handleOpen(res, false);
				});
			} else {
				saveNewDispensation(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					dispensation
				).then(res => {
					handleOpen(res, true);
				});
			}
		} else {
			setNotificationType(notificationsVariants['no-dispensation-chosen']);
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
		const errors = getErrorMessage(res, saveNew ? 'addDispensation' : 'updateDispensation');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else {
			setNotificationType(notificationsVariants['save-new-dispensation-success']);
			save(selectedDispensation ? selectedDispensation.dispensation : '');
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
		return room.isDeleted ? `${room.name} (${t("generic.deleted")})` : room.name;
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
				const errors = getErrorMessage(results, 'roomsWithPagination');
				setNotificationType(errors.notif);
				setOpenNotification(true);
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
				const errors = getErrorMessage(results, 'personFullText');
				setNotificationType(errors.notif);
				setOpenNotification(true);
			}
		}
		return [];
	};

	function getPersonTitle(person: personType) {
		return person.name + ' ' + person.surname;
	}

	function onChangeTickets(changedTickets: genericType[]) {
		setSelectedTickets(changedTickets);
	}

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={onAddDispensation}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={(selectedDispensation ? t('dispensation.modifyDispensation') : t('dispensation.addDispensation')) + " " + (selectedDispensation ? selectedDispensation.dispensation : '')}
									 type='selection'>
				<div style={{display: "flex", flexDirection: "column"}}>
					<div style={{display: "flex", flexDirection: "row"}}>
						<Select
							value={subject}
							style={{flex: '1', margin: "5px"}}
							onChange={(event: SelectChangeEvent) => {
								setSubject(event.target.value)
							}}
							label={t("dispensation.subject")}
						>
							{availableSubjects.map(as =>
								<MenuItem value={as}>{as}</MenuItem>
							)}

						</Select>
					</div>
					<div style={{display: "flex", flexDirection: "row", marginBottom: '10px'}}>
						<TextField
							label={t('dispensation.date_start')}
							type="date"
							disabled={!!selectedDispensation}
							value={formatDate(creationDate)}
							onChange={(e) => setCreationDate(new Date(e.target.value))}
							style={{flex: '1', margin: "5px"}}
						/>
						<TextField
							label={t('dispensation.date_end')}
							type="date"
							value={formatDate(expDate)}
							onChange={(e) => setExpDate(new Date(e.target.value))}
							style={{flex: '1', margin: "5px"}}
						/>
						<TextField
							label={t('dispensation.renewals')}
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
							label={t("dispensation.status")}
						>
							<MenuItem value={t("dispensation.statusDraft")}>{t("dispensation.statusDraft")}</MenuItem>
							<MenuItem value={t("dispensation.statusActive")}>{t("dispensation.statusActive")}</MenuItem>
							<MenuItem value={t("dispensation.statusExpired")}>{t("dispensation.statusExpired")}</MenuItem>
							<MenuItem value={t("dispensation.statusCancelled")}>{t("dispensation.statusCancelled")}</MenuItem>
						</Select>
					</div>
					<div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: '10px'}}>
						<div className="dispensation-panel">
							<label className='labelDetails'>{t(`dispensation.room`)}</label>
							<MultipleSelection selected={savedRooms} objectName="NewRoom"
																 onChangeSelection={onChangeRoom}
																 getCardTitle={getRoomTitle}
																 fetchData={fetchRoomList}/>
						</div>
						<div className="dispensation-panel">
							<label className='labelDetails'>{t(`dispensation.holders`)}</label>
							<MultipleSelection selected={savedHolders}
																 onChangeSelection={onChangeHolder}
																 objectName="Person"
																 getCardTitle={getPersonTitle}
																 fetchData={fetchPeople}/>
						</div>
						<div className="dispensation-panel">
							<label className='labelDetails'>{t(`dispensation.tickets`)}</label>
							<Source selected={savedTickets} onChangeSelection={onChangeTickets} type='ticket_number'/>
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
