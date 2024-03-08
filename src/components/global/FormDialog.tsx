import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {hazardFormType} from "../../utils/ressources/types";
import Textarea from "@mui/joy/Textarea";

interface FormDialogProps {
	openDialog: boolean;
	row?: hazardFormType;
	onClick?: (e: hazardFormType | undefined) => void;
}

export const FormDialog = ({
	openDialog,
	row,
	onClick
}: FormDialogProps) => {

	const handleClose = () => {
		if ( onClick ) {
			onClick(undefined);
		}
	};

	return (
			<Dialog
				open={openDialog}
				onClose={handleClose}
				PaperProps={{
					component: 'form',
					onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
						event.preventDefault();
						const formData = new FormData(event.currentTarget);
						const formJson = Object.fromEntries((formData as any).entries());
						if ( onClick ) {
							onClick({form: formJson.form, version: formJson.version, hazard_category: {hazard_category_name: row?.hazard_category.hazard_category_name ?? ''}});
						}
					},
				}}
			>
				<DialogTitle>Modify</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{row?.hazard_category.hazard_category_name}
					</DialogContentText>
					<TextField
						autoFocus
						required
						margin="dense"
						id="version"
						name="version"
						label={"New version (actual is " + row?.version +")"}
						fullWidth
						variant="standard"
					/>
					<Textarea
						placeholder="Insert new form"
						minRows={5}
						id="form"
						name="form"
						required
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button type="submit">Subscribe</Button>
				</DialogActions>
			</Dialog>
	);
}
