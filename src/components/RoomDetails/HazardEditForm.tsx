import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {HazardForm} from "./HazardForm";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import Notifications from "../Table/Notifications";
import {AlertDialog} from "../global/AlertDialog";
import {
	hazardAdditionalInfoType,
	hazardFormType,
	notificationType,
	roomDetailsType,
	submissionForm
} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import {createKey} from "../../utils/ressources/keyGenerator";
import {env} from "../../utils/env";
import {readFileAsBase64} from "../../utils/ressources/file";
import {addHazard} from "../../utils/graphql/PostingTools";
import {useTranslation} from "react-i18next";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardTitle} from "./HazardTitle";

interface HazardEditFormProps {
	room: roomDetailsType;
	selectedHazardCategory: string;
	lastVersionForm: hazardFormType | undefined;
	action: 'Add' | 'Edit' | 'Read';
	onChangeAction?: (hazardName: string) => void;
	onReadAction?: (hazardName: string) => void;
	roomList: string[];
	organismList: object[];
	initialSubmissionsList: submissionForm[];
	hazardAdditionalInfo: hazardAdditionalInfoType | undefined;
}

export const HazardEditForm = ({
		 room,
		 selectedHazardCategory,
		 lastVersionForm,
		 action,
		 onChangeAction,
		 onReadAction,
		 roomList,
		 organismList,
		 initialSubmissionsList,
		 hazardAdditionalInfo,
}: HazardEditFormProps) => {
	const { t } = useTranslation();
	const oidc = useOpenIDConnectContext();
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(false);
	const currentForm = lastVersionForm?.form ? JSON.parse(lastVersionForm?.form) : {};
	const currentFormChild = (lastVersionForm?.children && lastVersionForm?.children.length > 0) ?
		(lastVersionForm.children[0].form ? JSON.parse(lastVersionForm.children[0].form) : undefined) : undefined;
	const formsMapValidation = useRef<{[key: string]: boolean}>({});
	const [comment, setComment] = useState<string | undefined>();
	const [file, setFile] = useState<File | undefined>();
	const [_, setRender] = useState(0);
	const submissionsList = useRef<submissionForm[]>(initialSubmissionsList);
	const [openDialog, setOpenDialog] = useState<boolean>(action != 'Read');

	useEffect(() => {
		setOpenDialog(action != 'Read');
		const loadFetch = async () => {
			switch (action) {
				case "Add":
					onAddHazard(initialSubmissionsList);
					break;
				case "Edit":
					setSubmissionListAndValidationMap([...initialSubmissionsList], '', true);
					break;
			};
		};
		loadFetch();
		setComment(decodeURIComponent(hazardAdditionalInfo?.comment ?? ''));
		setFile(undefined);
	}, [oidc.accessToken, initialSubmissionsList]);

	function onAddHazard(submissions: submissionForm[]) {
		const newKey = createKey(10);
		const id = `{"salt":"newHazard${newKey}","eph_id":"newHazard${newKey}"}`;
		let children: { id: string; submission: { data: {}; }; form: any; }[] = [];
		if (currentFormChild) {
			children = [{
				id: `{"salt":"newHazardChild${newKey}","eph_id":"newHazardChild${newKey}"}`, submission: {data: {}},
				form: currentFormChild
			}];//TODO make it generic if there are more than one child, in this case add one form for each child
		}
		setSubmissionListAndValidationMap([...submissions, {
			id: id, submission: {data: {}},
			form: currentForm, children: children
		}], id, JSON.stringify(currentForm).indexOf('"required":true') == -1 &&
			(currentFormChild ? JSON.stringify(currentFormChild).indexOf('"required":true') == -1 : true));
	}

	function onAddHazardChild(parentId: string) {
		const newKey = createKey(10);
		const parent = submissionsList.current.find(s => s.id == parentId);
		if(parent) {
			const id = `{"salt":"newHazardChild${newKey}","eph_id":"newHazardChild${newKey}"}`;
			parent.children?.push({
				id: id, submission: {data: {}},
				form: currentFormChild});
			setSubmissionListAndValidationMap(submissionsList.current.map(s => s.id == parentId ? parent : s),
				id, JSON.stringify(currentFormChild).indexOf('"required":true') == -1);
		}
	}

	const setSubmissionListAndValidationMap = (submissions: submissionForm[], id: string, isValid: boolean) => {
		submissionsList.current = submissions;
		const map: {[key: string]: boolean} = {};
		submissions.forEach(s => {
			map[s.id] = s.submission.data.status == 'Deleted' || getValidationFromMapItem(s.id, id, isValid, JSON.stringify(s));
			s.children?.forEach(child => {
				map[child.id] = child.submission.data.status == 'Deleted' || getValidationFromMapItem(child.id, id, isValid, JSON.stringify(child));
			})
		});
		formsMapValidation.current = map;
		setIsSaveDisabled(Object.values(map).some(value => value === false));
		setRender(prev => prev + 1);
	}

	const onChangeSubmission = (id: string) => {
		return (newSubmission: object, isUnchanged: boolean, isValid: boolean) => {
			const oldSubmission = submissionsList.current.find(s => s.id == id);
			if(oldSubmission) {
				const changedSubmission = {id, submission: {data: newSubmission}, form: currentForm,
					children: oldSubmission.children};
				setSubmissionListAndValidationMap(submissionsList.current.map(s => s.id == id ? changedSubmission : s), id, isValid);
			}
		}
	}

	const onChangeChildSubmission = (id: string) => {
		return (newSubmission: object, isUnchanged: boolean, isValid: boolean) => {

			let oldParentSubmission: submissionForm | undefined;
			let oldChildSubmission: submissionForm | undefined;
			submissionsList.current.forEach(s => {
				const child = s.children?.find(c => c.id == id);
				if (child) {
					oldParentSubmission = s;
					oldChildSubmission = child;
				}
			});
			if(oldParentSubmission && oldChildSubmission) {
				const changedChildSubmission = {id, submission: {data: newSubmission}, form: currentFormChild};
				const updatedParentSubmissionChildren = oldParentSubmission.children?.map(s => s.id == id ? changedChildSubmission : s);
				const changedParentSubmission: submissionForm = {...oldParentSubmission, children: updatedParentSubmissionChildren};
				setSubmissionListAndValidationMap(submissionsList.current.map(s => s.id == oldParentSubmission?.id ? changedParentSubmission : s), id, isValid);
			}
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const getValidationFromMapItem = (itemId: string, checkedId: string, isValid: boolean, formJson: string): boolean => {
		if (itemId == checkedId) {
			return isValid;
		} else if (itemId in formsMapValidation.current) {
			return formsMapValidation.current[itemId];
		} else if (formJson.indexOf('"required":true') > -1) {
			return false;
		} else {
			return true;
		}
	}

	const handleSubmit = async () => {
		if (lastVersionForm)  {
			const submissionsToSave: submissionForm[] = [];
			submissionsList.current.forEach(f => {
				submissionsToSave.push({
					id: JSON.parse(f.id),
					submission: f.submission,
					children: f.children?.map(c => {
						const childForSave: submissionForm = {id: JSON.parse(c.id), submission: c.submission,
							formName: currentFormChild ? lastVersionForm!.children![0].hazard_form_child_name : ''};
						return childForSave;
					})
				})
			});
			let fileBase64 = await readFileAsBase64(file);
			addHazard(
				env().REACT_APP_GRAPHQL_ENDPOINT_URL,
				oidc.accessToken,
				submissionsToSave,
				lastVersionForm,
				room.name,
				{
					comment: encodeURIComponent(comment ?? ''),
					file: fileBase64,
					fileName: file?.name
				}
			).then(res => {
				handleOpen(res);
			});
		}
	};

	const handleOpen = async (res: any) => {
		if ( res.data?.addHazardToRoom?.errors ) {
			const notif: notificationType = {
				text: res.data?.addHazardToRoom?.errors[0].message,
				type: 'error'
			};
			setNotificationType(notif);
		} else if ( res.status === 200 ) {
			if ( onChangeAction ) {
				onChangeAction(selectedHazardCategory);
			}
			setNotificationType(notificationsVariants['room-update-success']);
		} else {
			setNotificationType(notificationsVariants['room-update-error']);
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return <AlertDialog openDialog={openDialog}
											onOkClick={handleSubmit}
											onCancelClick={() => {
												if ( onReadAction ) {
													onReadAction(selectedHazardCategory);
												}}}
											cancelLabel={t('generic.cancelButton')}
											okLabel={t('generic.saveButton')}
											isOkDisabled={isSaveDisabled}>
		<div style={{display: 'flex', flexDirection: 'column'}}>
			<HazardTitle hazardAdditionalInfo={hazardAdditionalInfo}
									 selectedHazardCategory={selectedHazardCategory}
									 handleFileChange={handleFileChange}
									 comment={comment}
									 setComment={setComment}
									 isReadonly={false}
									 room={room}
			/>
			<Button size="icon"
							iconName={"#plus-circle"}
							onClick={() => onAddHazard(submissionsList.current)}
							style={{visibility: action == "Edit" ? "visible" : "hidden"}}/>
			{submissionsList.current.map(sf => <div key={sf.id + action + 'div'}>
					<HazardForm submission={sf} action={action} onChangeSubmission={onChangeSubmission(sf.id)}
											key={sf.id + action} roomList={roomList} organismList={organismList}/>
					{currentFormChild &&
				<Button size="icon"
						iconName={"#plus-circle"}
						onClick={() => onAddHazardChild(sf.id)}
						style={{visibility: action == "Edit" ? "visible" : "hidden", marginLeft: '30px'}}/>}
					{sf.children && sf.children.map(child => <div key={child.id + action + 'div'}
																												style={{marginLeft: '30px', display: "flex", flexDirection: "row"}}>
							<Button size="icon"
											iconName={"#corner-down-right"}
											style={{marginRight: '5px', zIndex: '10'}}/>
							<HazardForm submission={child} action={action} onChangeSubmission={onChangeChildSubmission(child.id)}
													key={child.id + action} roomList={roomList} organismList={organismList}/>
						</div>
					)}
					<hr style={{height: '3px', backgroundColor: '#FFCECE'}}/>
				</div>
			)}
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</div>
	</AlertDialog>
}
