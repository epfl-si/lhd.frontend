import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useEffect} from "react";

interface AlertDialogProps {
	onOkClick?: () => void;
	onCancelClick?: () => void;
	title: string;
	body?: string;
	okLabel: string;
	cancelLabel: string;
	openDialog: boolean;
}

export const AlertDialog = ({
	onOkClick,
	onCancelClick,
	title,
	body,
	okLabel,
	cancelLabel,
	openDialog
}: AlertDialogProps) => {
	const [open, setOpen] = React.useState(false);

	useEffect(() => {
		setOpen(openDialog);
	}, [openDialog]);

	return (
			<Dialog
				open={open}
				onClose={onCancelClick}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description">
				<DialogTitle id="alert-dialog-title">
					{title}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						{body}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
				<Button onClick={onCancelClick}>{cancelLabel}</Button>
					<Button onClick={onOkClick} autoFocus>
						{okLabel}
					</Button>
				</DialogActions>
			</Dialog>
	);
}
