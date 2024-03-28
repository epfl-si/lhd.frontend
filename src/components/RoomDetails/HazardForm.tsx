import React, {useEffect, useState} from 'react';
import {submissionForm} from "../../utils/ressources/types";
import {Form} from "@formio/react";

interface HazardFormProps {
	submission: submissionForm;
	action: 'Add' | 'Edit' | 'Read';
	onChangeSubmission: (submissionFormChanged: object, submissionFormOriginal: submissionForm) => void;
}

export const HazardForm = ({
	submission,
	action,
	onChangeSubmission
}: HazardFormProps) => {
	const [optionsForm, setOptionsForm] = useState<{readOnly: boolean}>({readOnly: action == "Read"});//i18n: {en: {},},

	useEffect(() => {
		setOptionsForm({...{readOnly: action == "Read"}})
	}, [action]);

	return <Form
		onChange={(event) => {
			if(event.changed) {
				onChangeSubmission(event.data, submission);
			}
		}}
		options={optionsForm}
		key={submission.id}
		submission={submission.submission}
		form={submission.form}/>
};
