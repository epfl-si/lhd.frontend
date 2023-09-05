import { Box, Snackbar } from '@material-ui/core';
import { Alert, AlertColor } from '@mui/material';

type NotificationsProps = {
	open: boolean;
	notification: {
		type: AlertColor;
		text: string;
	};
	close: () => void;
	additionalInfo?: string;
};

export default function Notifications({
	open,
	notification,
	close,
	additionalInfo,
}: NotificationsProps) {
	return (
		<Box>
			<Snackbar open={open} autoHideDuration={3000} onClose={close}>
				<Alert onClose={close} severity={notification.type} sx={{ width: '100%' }}>
					{notification.text} {additionalInfo}
				</Alert>
			</Snackbar>
		</Box>
	);
}
