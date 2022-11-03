import { Box, Snackbar } from '@material-ui/core';
import { Alert } from '@mui/material';

export default function Notifications({ open, notification, close }) {
	return (
		<Box>
			<Snackbar open={open} autoHideDuration={3000} onClose={close}>
				<Alert onClose={close} severity={notification.type} sx={{ width: '100%' }}>
					{notification.text}
				</Alert>
			</Snackbar>
		</Box>
	);
}
