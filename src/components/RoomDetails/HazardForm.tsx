import React, {useCallback, useEffect, useState} from 'react';
import {submissionForm} from "../../utils/ressources/types";
import {Form} from "@formio/react";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import { fetchFile } from '../../utils/ressources/file';
import { useTranslation } from 'react-i18next';
import formTraslation from '../../utils/lang/formTranslation.json';

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
	const { i18n } = useTranslation();
	const [optionsForm] = useState<{readOnly: boolean, language: string, i18n: any}>(
		{readOnly: action == "Read", language: i18n.language,
		i18n: formTraslation});
	const oidc = useOpenIDConnectContext();

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
		if ( event.component.key == "otherImpactedRooms" ) {
			event.component.data.json = roomList?.filter(room => room != null);
		} else if ( event.component.key == "organism" ) {
			event.component.data.json = organismList?.filter(organism => organism != null);
		}
	}, []);

	const handleClick = async (event: any) => {
		if (!event.defaultPrevented) {
			event.preventDefault();
			await fetchFile(
				oidc.accessToken,
				decodeURIComponent(event.target.href.substring(event.target.href.indexOf('d_bio/')))
			);
		}
	};

	const handleRender = useCallback(() => {
		setTimeout(() => {
			const linkElements = document.querySelectorAll('[id*="_organism_link"]');
			linkElements.forEach(linkElement => {
				linkElement.addEventListener('click', handleClick);
			});

			return () => {
				linkElements.forEach(linkElement => {
					linkElement.removeEventListener('click', handleClick);
				});
			};
		}, 0);
	}, [handleClick]);

	useEffect(() => {
		handleRender();
	}, [handleRender]);

	return <Form
		onChange={handleChange}
		onFocus={handleFocus}
		onRender={handleRender}
		options={optionsForm}
		key={submission.id + action}
		submission={submission.submission}
		form={submission.form}/>
};
