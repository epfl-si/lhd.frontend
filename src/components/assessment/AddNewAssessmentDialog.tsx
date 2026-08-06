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
import {fetchAssessmentHistory, fetchAssessmentSubjects,} from "../../utils/graphql/FetchingTools";
import {MultipleSelection} from "../global/MultipleSelection";
import {getErrorMessage} from "../../utils/graphql/Utils";
import {Source} from '../radioprotection/SourceList';
import {TextArea} from "epfl-elements-react-si-extra";
import {sprintf} from "sprintf-js";
import {MutationLogsTable} from "../global/MutationLogsTable";
import {CircularProgress} from "@mui/joy";
import {formatDateForPickers} from "../../utils/ressources/parser";
import {commonFetchPeople, commonFetchRoomList, commonFetchUnitsListByRooms} from "../../utils/graphql/commonQueries";
import {saveNewAssessment, updateAssessment} from "../../utils/graphql/PostingTools";
import MultiFileUploader from "../global/MultiFileUploader";

interface AddNewAssessmentDialogProps {
	openDialog: boolean;
	save: (searchVal: string) => void;
	close: () => void;
	selectedAssessment?: assessmentType;
	onDelete?: (organism: assessmentType) => void;
}

export const AddNewAssessmentDialog = ({
																			 openDialog,
																			 close,
																			 save,
																				 selectedAssessment,
																				 onDelete
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
	const [selectedFiles, setSelectedFiles] = useState<genericType[]>([]);
	const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
	const [history, setHistory] = useState<any[]>([]);
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

		setSelectedFiles(selectedAssessment ? selectedAssessment.assessment_files : []);
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
		const assessment = {creationDate,status,
			subject,other,conclusion,description,selectedTickets,selectedContacts,selectedRooms, selectedUnits, selectedFiles};
		if (selectedAssessment) {
			updateAssessment(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				JSON.stringify(selectedAssessment.id),
				assessment
			).then(res => {
				handleOpen(res, false);
			});
		} else {
			saveNewAssessment(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				assessment
			).then(res => {
				handleOpen(res, true);
			});
		}
	}

	async function askForConfirmation () {
		if (description && subject && (subject !== 'Other' || (subject === 'Other' && other))
			&& (status === 'Draft' || (selectedRooms.filter(item => item.status !== 'Deleted').length > 0
				&& selectedUnits.filter(item => item.status !== 'Deleted').length > 0))) {
			await onAddAssessment();
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
		const errors = getErrorMessage(res, saveNew ? 'addAssessmentDecision' : 'updateAssessmentDecision');
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
		return await commonFetchRoomList(oidc.accessToken, newValue, setNotificationType, setOpenNotification);
	};

	const fetchUnitsList = async () => {
		return commonFetchUnitsListByRooms(oidc.accessToken, selectedRooms, setNotificationType, setOpenNotification);
	};

	const fetchPeople = async (newValue: string): Promise<personType[]> => {
		return commonFetchPeople(oidc.accessToken, newValue, setNotificationType, setOpenNotification);
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
									 onOkClick={askForConfirmation}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={(selectedAssessment ? t('assessment.modifyAssessment') : t('assessment.addAssessment')) + " " + (selectedAssessment ? selectedAssessment.assessment : '')}
									 deleteLabel={t('generic.deleteButton')}
									 onDeleteClick={onDelete}
									 data={selectedAssessment}
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
							<MultiFileUploader
								maxFiles={10}
								model={'assessment'}
								selectedFiles={selectedFiles}
								setSelectedFiles={setSelectedFiles}
								selectedId={selectedAssessment?.id ?? ''} />
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
									<MenuItem value={as} key={as}>{as}</MenuItem>
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
							value={formatDateForPickers(creationDate)}
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
						<div className="dispensation-panel">
							<label className='labelDetails'>{t(`assessment.room`)}</label>
							<MultipleSelection selected={savedRooms} objectName="NewRoom"
																 onChangeSelection={onChangeRoom}
																 getCardTitle={getRoomTitle}
																 fetchData={fetchRoomList}/>
						</div>
						<div className="dispensation-panel">
							<label className='labelDetails'>{t(`assessment.unit`)}</label>
							{selectedRooms && <MultipleSelection selected={savedUnits} objectName="Unit"
																	onChangeSelection={onChangeUnit}
																	getCardTitle={getUnitTitle}
																	fetchData={fetchUnitsList}/>}
						</div>
						<div className="dispensation-panel">
							<label className='labelDetails'>{t(`assessment.contacts`)}</label>
							<MultipleSelection selected={savedContacts}
																 onChangeSelection={onChangeContact}
																 objectName="Person"
																 getCardTitle={getPersonTitle}
																 fetchData={fetchPeople}/>
						</div>
						<div className="dispensation-panel">
							<label className='labelDetails'>{t(`assessment.tickets`)}</label>
							<Source selected={savedTickets} onChangeSelection={onChangeTickets} type='ticket_number'/>
						</div>
					</div>
					<MutationLogsTable history={history} />
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
