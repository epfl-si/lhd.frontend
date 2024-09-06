import * as React from 'react';
import {useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

interface AlertDialogProps {
	onOkClick?: () => void;
	onCancelClick?: () => void;
	title: string;
	children?: React.ReactNode;
	okLabel: string;
	cancelLabel: string;
	openDialog: boolean;
}

export const AlertDialog = ({
	onOkClick,
	onCancelClick,
	title,
	children,
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
				<DialogContent
				style={{minWidth:'300px', minHeight: '400px'}}>
					{children}
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
