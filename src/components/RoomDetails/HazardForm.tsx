import React, {useEffect, useState} from 'react';
import {submissionForm} from "../../utils/ressources/types";
import {Form} from "@formio/react";

interface HazardFormProps {
	submission: submissionForm;
	action: 'Add' | 'Edit' | 'Read';
	onChangeSubmission: (newSubmission: object, isUnchanged: boolean) => void;
}

export const HazardForm = ({
	submission,
	action,
	onChangeSubmission
}: HazardFormProps) => {
	const [optionsForm] = useState<{readOnly: boolean}>({readOnly: action == "Read"});//i18n: {en: {},},

	// Unfortunately, <Form> will mutate the `submission` as the user updates the form. In order to know the dirty
	// state, we must remember the mount-time value:
	const [initialSubmission] = useState(JSON.stringify(submission.submission.data));
	const isDataTheSame = (sub : any) => JSON.stringify(sub) === initialSubmission;

	return <Form
		onChange={(event) => {
			if(event.changed) {
				onChangeSubmission(event.data, isDataTheSame(event.data));
			}
		}}
		options={optionsForm}
		key={submission.id}
		submission={submission.submission}
		form={submission.form}/>
};
