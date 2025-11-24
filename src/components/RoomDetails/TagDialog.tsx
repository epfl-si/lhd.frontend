import * as React from 'react';
import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {AlertDialog} from "../global/AlertDialog";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {hazardsAdditionalInfoHasTagType, notificationType, tag} from "../../utils/ressources/types";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {TextField} from "@material-ui/core";
import {saveTag, updateTag} from "../../utils/graphql/PostingTools";
import {Autocomplete} from "@mui/material";
import {getErrorMessage} from "../../utils/graphql/Utils";
import {fetchTags} from "../../utils/graphql/FetchingTools";
import {TextArea} from "epfl-elements-react-si-extra";
import {createKey} from "../../utils/ressources/keyGenerator";

interface TagDialogProps {
	openDialog: boolean;
	save: () => void;
	close: () => void;
	selectedTag?: hazardsAdditionalInfoHasTagType;
	additionalInfo: string;
}

export const TagDialog = ({
	openDialog,
	close,
	save,
	selectedTag,
	additionalInfo
}: TagDialogProps) => {
	const oidc = useOpenIDConnectContext();
	const { t } = useTranslation();
	const [notificationType, setNotificationType] = useState<notificationType>({
		type: "info",
		text: '',
	});
	const [openNotification, setOpenNotification] = useState<boolean>(false);
	const [comment, setComment] = useState<string>("");
	const [tag, setTag] = useState<string>();
	const [tags, setTags] = useState<tag[]>([]);

	useEffect(() => {
		loadTags();
		setTag(selectedTag?.tag.tag_name);
		setComment(selectedTag?.comment ?? '');
	}, [openDialog, selectedTag]);

	const loadTags = async () => {
		const results = await fetchTags(
			env().REACT_APP_GRAPHQL_ENDPOINT_URL,
			oidc.accessToken,
		);
		if ( results.status === 200 && results.data ) {
			setTags(results.data);
		} else {
			const errors = getErrorMessage(results, 'tags');
			setNotificationType(errors.notif);
			setOpenNotification(true);
		}
	};

	async function onAddTag() {
		if (tag) {
			if (selectedTag) {
				updateTag(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					JSON.stringify(selectedTag.id),
					comment
				).then(res => {
					handleOpen(res, false);
				});
			} else {
				const newKey = createKey(10);
				saveTag(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					`{"salt":"newTag${newKey}","eph_id":"newTag${newKey}"}`,
					tag,
					comment,
					additionalInfo
				).then(res => {
					handleOpen(res, true);
				});
			}
		} else {
			setNotificationType(notificationsVariants['no-tag-chosen']);
			setOpenNotification(true);
		}
	}

	const handleOpen = (res: any, saveNew: boolean) => {
		const errors = getErrorMessage(res, saveNew ? 'addTag' : 'updateTag');
		if (errors.errorCount > 0) {
			setNotificationType(errors.notif);
		} else {
			setNotificationType(notificationsVariants['update_success']);
			save();
		}
		setOpenNotification(true);
	};

	const handleClose = () => {
		setOpenNotification(false);
	};

	return (
		<>
			<AlertDialog openDialog={openDialog}
									 onOkClick={onAddTag}
									 onCancelClick={close}
									 cancelLabel={t('generic.cancelButton')}
									 okLabel={t('generic.saveButton')}
									 title={selectedTag ? t('hazard.modifyTag') : t('hazard.addNewTag')}
									 type='selection'>
				<Autocomplete
					value={tag}
					disabled={selectedTag !== undefined}
					onChange={(event: any, newValue: string | null) => {
						if ( newValue ) {
							setTag(newValue);
						}
					}}
					id="tag"
					key={tag}
					options={tags.map(k => k.tag_name)}
					renderInput={(params) => <TextField {...params} />}
				/>
				<TextArea
					id={"comment"}
					name="comment"
					label={t('generic.comment')}
					key={selectedTag + "_key"}
					onChange={setComment}
					value={comment}
				/>
			</AlertDialog>
			<Notifications
				open={openNotification}
				notification={notificationType}
				close={handleClose}
			/>
		</>
	);
}
