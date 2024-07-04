import React, {useCallback, useState} from 'react';
import {submissionForm} from "../../utils/ressources/types";
import {Form} from "@formio/react";

interface HazardFormProps {
	submission: submissionForm;
	action: 'Add' | 'Edit' | 'Read';
	onChangeSubmission: (newSubmission: object, isUnchanged: boolean, isValid: boolean) => void;
	roomList: string[];
	organismList: object[];
}

export const HazardForm = ({
	submission,
	action,
	onChangeSubmission,
	roomList,
	organismList
}: HazardFormProps) => {
	const [optionsForm] = useState<{readOnly: boolean}>({readOnly: action == "Read"});//i18n: {en: {},},

	// Unfortunately, <Form> will mutate the `submission` as the user updates the form. In order to know the dirty
	// state, we must remember the mount-time value:
	const [initialSubmission] = useState(JSON.stringify(submission.submission.data));
	const isDataTheSame = (sub : any) => JSON.stringify(sub) === initialSubmission;

	const handleChange = useCallback((event: any) => {
		if (event.changed) {
			onChangeSubmission(event.data, isDataTheSame(event.data), event.isValid);
		}
	}, []);

	const handleFocus = useCallback((event: any) => {
		if ( event.component.key == "otherImpactedRooms") {
			event.component.data.json = roomList?.filter(room => room != null);
		} else if (event.component.key == "organism") {
			event.component.data.json = organismList?.filter(organism => organism != null);
		}
	}, []);

	return <Form
		onChange={handleChange}
		onFocus={handleFocus}
		options={optionsForm}
		key={submission.id + action}
		submission={submission.submission}
		form={submission.form}/>
};
