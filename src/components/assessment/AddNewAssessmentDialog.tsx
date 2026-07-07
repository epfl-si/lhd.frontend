import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {
	assessmentType,
	genericType,
	lhdUnitsType,
	notificationType,
	personType,
	roomDetailsType
} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {Box, InputLabel, MenuItem, TextField} from "@material-ui/core";
import {
	fetchAssessmentHistory,
	fetchAssessmentSubjects,
	fetchPeopleFromFullText,
	fetchRooms,
} from "../../utils/graphql/FetchingTools";
import {MultipleSelection} from "../global/MultipleSelection";
import {getErrorMessage} from "../../utils/graphql/Utils";
import {Source} from '../radioprotection/SourceList';
import {TextArea} from "epfl-elements-react-si-extra";
import {sprintf} from "sprintf-js";
import {MutationLogsTable} from "../global/MutationLogsTable";
import {ConfirmSavingAssessmentDialog} from "./ConfirmSavingAssessmentDialog";
import {CircularProgress} from "@mui/joy";
import {getFormattedDate} from "../../utils/ressources/parser";

interface AddNewAssessmentDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
	selectedAssessment?: assessmentType;
}

export const AddNewAssessmentDialog = ({
																			 openDialog,
																			 close,
																			 save,
																				 selectedAssessment
																		 }: AddNewAssessmentDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [creationDate, setCreationDate] = useState<Date>(selectedAssessment ? selectedAssessment.date : new Date());
	const [status, setStatus] = useState<string>(selectedAssessment ? selectedAssessment.status : 'Active');
	const [subject, setSubject] = useState<string | undefined>(selectedAssessment?.subject);
	const [other, setOther] = useState<string | undefined>(selectedAssessment?.subject_other);
	const [conclusion, setConclusion] = useState<string | undefined>(selectedAssessment?.conclusion);
	const [description, setDescription] = useState<string | undefined>(selectedAssessment?.description);
	const [savedRooms, setSavedRooms] = useState<roomDetailsType[]>([]);
	const [selectedRooms, setSelectedRooms] = useState<roomDetailsType[]>([]);
	const [savedUnits, setSavedUnits] = useState<lhdUnitsType[]>([]);
	const [selectedUnits, setSelectedUnits] = useState<lhdUnitsType[]>([]);
	const [savedContacts, setSavedContacts] = useState<personType[]>([]);
	const [selectedContacts, setSelectedContacts] = useState<personType[]>([]);
	const [savedTickets, setSavedTickets] = useState<genericType[]>([]);
	const [selectedTickets, setSelectedTickets] = useState<genericType[]>([]);
	const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
	const [history, setHistory] = useState<any[]>([]);
	const [file, setFile] = useState<[]>();
	const [openDialogConfirm, setOpenDialogConfirm] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadSubjects();
		loadHistory();
		setCreationDate(selectedAssessment ? selectedAssessment.date : new Date());
		setStatus(selectedAssessment ? selectedAssessment.status : 'Draft');
		setSubject(selectedAssessment?.subject);
		setConclusion(selectedAssessment ? selectedAssessment.conclusion : '');
		setDescription(selectedAssessment ? selectedAssessment.description : '');
		setOther(selectedAssessment ? selectedAssessment.subject_other : '')

		setSavedRooms(selectedAssessment ? selectedAssessment.assessment_rooms : []);
		setSelectedRooms(selectedAssessment ? selectedAssessment.assessment_rooms : []);

		setSavedUnits(selectedAssessment ? selectedAssessment.assessment_units : []);
		setSelectedUnits(selectedAssessment ? selectedAssessment.assessment_units : []);

		setSavedContacts(selectedAssessment ? selectedAssessment.assessment_contacts : []);
		setSelectedContacts(selectedAssessment ? selectedAssessment.assessment_contacts : []);

		setSavedTickets(selectedAssessment ? selectedAssessment.assessment_tickets : []);
		setSelectedTickets(selectedAssessment ? selectedAssessment.assessment_tickets : []);
	}, [openDialog, selectedAssessment]);

	const loadSubjects = async () => {
		const results = await fetchAssessmentSubjects(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken
		);
		if (results.status === 200 && results.data){
			setAvailableSubjects(results.data.map(ass => ass.subject));
		} else {
			const errors = getErrorMessage(results, 'assessmentSubjects');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
	};

	const loadHistory = async () => {
		setHistory([]);
		if (selectedAssessment && openDialog) {
			const results = await fetchAssessmentHistory(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				selectedAssessment.id
			);
			if (results.status === 200 && results.data){
				setHistory(results.data);
			}
		}
	};

	async function onAddAssessment() {
		setLoading(true);
		setOpenDialogConfirm(false);
		const assessment = {creationDate,status,
			subject,other,conclusion,description,selectedTickets,selectedContacts,selectedRooms, selectedUnits};
		// if (selectedAssessment) {
		// 	updateAssessment(
		// 		env().REACT_APP_GRAPHQL_ENDPOINT_URL,
		// 		oidc.accessToken,
		// 		JSON.stringify(selectedAssessment.id),
		// 		assessment
		// 	).then(res => {
		// 		handleOpen(res, false);
		// 	});
		// } else {
		// 	saveNewAssessment(
		// 		env().REACT_APP_GRAPHQL_ENDPOINT_URL,
		// 		oidc.accessToken,
		// 		assessment
		// 	).then(res => {
		// 		handleOpen(res, true);
		// 	});
		// }
	}

	async function askForConfirmation () {
		if (description && subject && (subject !== 'Other' || (subject === 'Other' && other))
			&& (status === 'Draft' || (selectedRooms.filter(item => item.status !== 'Deleted').length > 0
				&& selectedUnits.filter(item => item.status !== 'Deleted').length > 0))) {
			if (status !== 'Draft') {
				setOpenDialogConfirm(true);
			} else {
				await onAddAssessment();
			}
		} else {
			setNotificationType(notificationsVariants['no-assessment-chosen']);
			setOpenNotification(true);
		}
	}

	function onChangeRoom(changedRooms: roomDetailsType[]) {
		setSelectedRooms(changedRooms);
	}

	function onChangeUnit(changedUnits: lhdUnitsType[]) {
		setSelectedUnits(changedUnits);
	}

	function onChangeContact(changedContacts: personType[]) {
		setSelectedContacts(changedContacts);
	}

	const handleOpen = (res: any, saveNew: boolean) => {
		const errors = getErrorMessage(res, saveNew ? 'addAssessment' : 'updateAssessment');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else {
			setNotificationType(notificationsVariants['save-new-assessment-success']);
			save(selectedAssessment ? selectedAssessment.assessment : '');
		}
		setLoading(false);
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	function getRoomTitle(room: roomDetailsType) {
		return room.isDeleted ? `${room.name} (${t("generic.deleted")})` : room.name;
	}

	function getUnitTitle(unit: lhdUnitsType) {
		return unit.name;
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

	const fetchUnitsList = async () => {
		if (selectedRooms.length > 0) {
			const rooms = selectedRooms.filter(room => room.status !== 'Deleted').map(room => room.name);
			const results = await fetchUnitsForAssessment(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				rooms
			);
			if (results.status === 200) {
				if (results.data) {
					return (results.data);
				} else {
					const errors = getErrorMessage(results, 'unitsForAssessment');
					setNotificationType(errors.notif);
					setOpenNotification(true);
				}
			}
		}
		return ([]);
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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={askForConfirmation}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={(selectedAssessment ? t('assessment.modifyAssessment') : t('assessment.addAssessment')) + " " + (selectedAssessment ? selectedAssessment.assessment : '')}
									 type='selection'>
				{loading && <Box
					sx={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 9999
					}}
				>
					<CircularProgress />
				</Box>}
				<div style={{display: "flex", flexDirection: "column"}}>
					<div style={{display: "flex", flexDirection: "row"}}>
						<div style={{display: "flex", flexDirection: "column"}}>
							<div>
								<input id="file" style={{fontSize: 'small'}} type="file" onChange={handleFileChange} accept='.pdf'/>
							</div>




						</div>
						{selectedAssessment && <div style={{display: "flex", flexDirection: "column"}}><label
				style={{fontStyle: "italic", fontSize: "small", marginBottom: '0px'}}
				className="hazardTitle">{sprintf(t(`hazards.creation_info`), selectedAssessment.created_by,
							(new Date(selectedAssessment.created_on)).toLocaleString('fr-CH', {
								year: 'numeric',
								month: 'numeric',
								day: 'numeric',
								hour: 'numeric',
								minute: 'numeric',
								hour12: false
							}))}</label>
				<label
					style={{fontStyle: "italic", fontSize: "small", marginBottom: '0px'}}
					className="hazardTitle">{sprintf(t(`hazards.modification_info`), selectedAssessment.modified_by,
									(new Date(selectedAssessment.modified_on)).toLocaleString('fr-CH', {
										year: 'numeric',
										month: 'numeric',
										day: 'numeric',
										hour: 'numeric',
										minute: 'numeric',
										hour12: false
									}))}</label></div>}
					</div>
					<div className="rowDiv">
						<div style={{flex: '1', margin: "5px", display: "flex", flexDirection: "column"}}>
							<InputLabel id="subject_label" style={{fontSize: "small", fontWeight: "bold"}}>{t("assessment.subject")}</InputLabel>
							<Select
								labelId="subject_label"
								value={subject}
								onChange={(event: SelectChangeEvent) => {
									setSubject(event.target.value)
								}}
								label={t("assessment.subject")}
							>
								{availableSubjects.map(as =>
									<MenuItem value={as}>{as}</MenuItem>
								)}
							</Select>
						</div>
						<TextField
							label={t('assessment.other')}
							fullWidth
							required={subject === 'Other'}
							hidden={subject !== 'Other'}
							value={other}
							onChange={(event) => setOther(event.target.value)}
							style={{flex: '1', margin: "5px"}}
						/>
					</div>
					<div className="rowDiv">
						<TextField
							label={t('assessment.date')}
							type="date"
							required={true}
							disabled={!!selectedAssessment}
							value={getFormattedDate(creationDate, '-')}
							onChange={(e) => setCreationDate(new Date(e.target.value))}
							style={{flex: '1', margin: "5px"}}
						/>
						<div style={{flex: '1', margin: "5px", display: "flex", flexDirection: "column"}}>
							<InputLabel id="status_label" style={{fontSize: "small", fontWeight: "bold"}}>{t("assessment.status")}</InputLabel>
							<Select
								labelId="status_label"
								value={status}
								onChange={(event: SelectChangeEvent) => {
									setStatus(event.target.value)
								}}
								label={t("assessment.status")}
							>
								<MenuItem value={t("assessment.statusDraft")}>{t("assessment.statusDraft")}</MenuItem>
								<MenuItem value={t("assessment.statusActive")}>{t("assessment.statusActive")}</MenuItem>
								<MenuItem value={t("assessment.statusClosed")}>{t("assessment.statusClosed")}</MenuItem>
							</Select>
						</div>
					</div>
					<div className="rowDiv">
						<div style={{width: '50%'}}>
							<TextArea
								id={"requirement"}
								name="requirement"
								isRequired={true}
								label={t('assessment.description')}
								onChange={(event) => setDescription(event)}
								value={description}
							/></div>
						<div style={{width: '50%', marginLeft: '5px'}}>
						<TextArea
							id={"conclusion"}
							name="conclusion"
							label={t('assessment.conclusion')}
							onChange={(event) => setConclusion(event)}
							value={conclusion}
						/></div>
					</div>
					<div className="rowDiv">
						<div className="assessment-panel">
							<label className='labelDetails'>{t(`assessment.room`)}</label>
							<MultipleSelection selected={savedRooms} objectName="NewRoom"
																 onChangeSelection={onChangeRoom}
																 getCardTitle={getRoomTitle}
																 fetchData={fetchRoomList}/>
						</div>
						<div className="assessment-panel">
							<label className='labelDetails'>{t(`assessment.unit`)}</label>
							{selectedRooms && <MultipleSelection selected={savedUnits} objectName="Unit"
																	onChangeSelection={onChangeUnit}
																	getCardTitle={getUnitTitle}
																	fetchData={fetchUnitsList}/>}
						</div>
						<div className="assessment-panel">
							<label className='labelDetails'>{t(`assessment.contacts`)}</label>
							<MultipleSelection selected={savedContacts}
																 onChangeSelection={onChangeContact}
																 objectName="Person"
																 getCardTitle={getPersonTitle}
																 fetchData={fetchPeople}/>
						</div>
						<div className="assessment-panel">
							<label className='labelDetails'>{t(`assessment.tickets`)}</label>
							<Source selected={savedTickets} onChangeSelection={onChangeTickets} type='ticket_number'/>
						</div>
					</div>
					<MutationLogsTable history={history} />
				</div>
			</AlertDialog>
			<ConfirmSavingAssessmentDialog
				openDialog={openDialogConfirm}
				setOpenDialog={setOpenDialogConfirm}
				onAddAssessment={onAddAssessment}
			/>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
