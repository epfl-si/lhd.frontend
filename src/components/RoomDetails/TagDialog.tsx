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
import {TextArea} from "epfl-elements-react-si-extra";
import {createKey} from "../../utils/ressources/keyGenerator";

interface TagDialogProps {
	openDialog: boolean;
	save: () => void;
	close: () => void;
	selectedTag?: hazardsAdditionalInfoHasTagType;
	additionalInfo?: string;
	availableTags: tag[];
	categoryName: string;
	roomId?: string;
}

export const TagDialog = ({
	openDialog,
	close,
	save,
	selectedTag,
	additionalInfo,
	availableTags,
	categoryName,
	roomId
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

	useEffect(() => {
		setTag(selectedTag?.tag.tag_name);
		setComment(selectedTag?.comment ?? '');
	}, [openDialog, selectedTag]);

	async function onAddTag() {
		if (tag && comment) {
			if (selectedTag?.id) {
				updateTag(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					JSON.stringify(selectedTag.id),
					comment
				).then(res => {
					handleOpen(res, false);
				});
			} else {
				saveTag(
					env().REACT_APP_GRAPHQL_ENDPOINT_URL,
					oidc.accessToken,
					tag,
					comment,
					additionalInfo ?? '',
					categoryName,
					roomId ?? ''
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
					onChange={(event: any, newValue: string | null) => {
						if ( newValue ) {
							setTag(newValue);
						}
					}}
					id="tag"
					key={tag}
					options={availableTags.map(k => k.tag_name)}
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
