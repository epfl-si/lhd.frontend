import React, {useEffect, useState} from 'react';
import {submissionForm} from "../../utils/ressources/types";
import {Form} from "@formio/react";

interface HazardFormProps {
	submission: submissionForm;
	formData:submissionForm[];
	action: 'Add' | 'Edit' | 'Read';
	onChangeSubmission: (submissionForms: submissionForm[]) => void;
}

export const HazardForm = ({
	submission,
	formData,
	action,
	onChangeSubmission
}: HazardFormProps) => {
	const [optionsForm, setOptionsForm] = useState<{readOnly: boolean}>({readOnly: action == "Read"});//i18n: {en: {},},

	useEffect(() => {
		setOptionsForm({...{readOnly: action == "Read"}})
	}, [action]);

	return <Form
		onChange={(event) => {
			const submissions = formData.filter(f => f.id != submission.id);
			submissions.push({id: submission.id, submission: {data: event.data}});
			onChangeSubmission([...submissions])
			}}
			options={optionsForm}
			key={submission.id}
			submission={submission.submission}
			form={submission.form}/>
};
